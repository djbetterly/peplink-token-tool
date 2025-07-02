
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { client_id, client_secret, redirect_uri, code } = req.body;

    const tokenResponse = await fetch("https://api.ic.peplink.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: "Error exchanging code",
        details: tokenData
      });
    }

    res.status(200).json(tokenData);

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}
