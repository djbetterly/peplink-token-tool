export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get("code");

    if (!code) {
      return res.status(400).send("Missing authorization code.");
    }

    // These values are sent from the browser in a query param (NOT secure for production!)
    const clientId = url.searchParams.get("client_id") || "";
    const clientSecret = url.searchParams.get("client_secret") || "";
    const redirectUri = url.searchParams.get("redirect_uri") || "";

    // You could move these to environment variables for security in production.

    // Exchange code for token
    const tokenResponse = await fetch("https://api.ic.peplink.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ error: "Error exchanging code", details: tokenData });
    }

    // Build a page showing the token JSON
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <html>
      <body>
        <h2>OAuth Token Retrieved</h2>
        <pre>${JSON.stringify(tokenData, null, 2)}</pre>
        <p>Copy the access_token and use it in API calls.</p>
      </body>
      </html>
    `);

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}

