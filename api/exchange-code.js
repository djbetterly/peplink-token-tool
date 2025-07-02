export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Log exactly what body arrived
    console.log("DEBUG: Raw body received:", req.body);

    const { client_id, client_secret, redirect_uri, code } = req.body || {};

    // If any are missing, return immediately
    if (!client_id || !client_secret || !redirect_uri || !code) {
      return res.status(400).json({
        error: "Missing required fields",
        received: { client_id, client_secret, redirect_uri, code }
      });
    }

    const tokenResponse = await fetch("https://api.ic.peplink.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id,
        client_secret,
        grant_type: "authorization_code",
        code,
        redirect_uri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: "Error exchanging code",
        details: tokenData
      });
    }

    return res.status(200).json(tokenData);

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}
