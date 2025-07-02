export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { access_token, org_id } = req.body;

    if (!access_token || !org_id) {
      return res.status(400).json({ error: "Missing access_token or org_id" });
    }

    // Correct URL to list devices
    const response = await fetch(`https://api.ic.peplink.com/rest/o/${org_id}/d?access_token=${access_token}`);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error fetching devices",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}
