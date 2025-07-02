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
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
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
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    };

    // 2️⃣ Get Organizations (raw text)
    const orgResponse = await fetch("https://api.ic.peplink.com/api/v2/organizations", {
      headers
    });

    const orgText = await orgResponse.text();

    // Always return raw response for inspection
    res.status(orgResponse.status).json({
      status: orgResponse.status,
      statusText: orgResponse.statusText,
      rawResponse: orgText
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}
