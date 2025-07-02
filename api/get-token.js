export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { client_id, client_secret } = req.body;

    const authString = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

    // 1️⃣ Get Access Token
    const tokenResponse = await fetch("https://api.ic.peplink.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ error: "Error fetching access token", details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // Prepare headers
    const headers = {
      "Authorization": `Bearer ${accessToken}`
    };

    // 2️⃣ Get Organizations
    const orgResponse = await fetch("https://api.ic.peplink.com/api/v2/organizations", {
      headers
    });
    const orgData = await orgResponse.json();

    if (!orgResponse.ok) {
      return res.status(orgResponse.status).json({ error: "Error fetching organizations", details: orgData });
    }

    const firstOrgId = orgData.data?.[0]?.id;

    let groupsData = {};
    let devicesData = {};

    if (firstOrgId) {
      // 3️⃣ Get Groups
      const groupsResponse = await fetch(`https://api.ic.peplink.com/api/v2/groups?organization_id=${firstOrgId}`, {
        headers
      });
      groupsData = await groupsResponse.json();

      if (!groupsResponse.ok) {
        return res.status(groupsResponse.status).json({ error: "Error fetching groups", details: groupsData });
      }

      const firstGroupId = groupsData.data?.[0]?.id;

      if (firstGroupId) {
        // 4️⃣ Get Devices
        const devicesResponse = await fetch(`https://api.ic.peplink.com/api/v2/devices?group_id=${firstGroupId}`, {
          headers
        });
        devicesData = await devicesResponse.json();

        if (!devicesResponse.ok) {
          return res.status(devicesResponse.status).json({ error: "Error fetching devices", details: devicesData });
        }
      }
    }

    // 5️⃣ Success
    res.status(200).json({
      token: tokenData,
      organizations: orgData,
      groups: groupsData,
      devices: devicesData
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message, stack: err.stack });
  }
}
