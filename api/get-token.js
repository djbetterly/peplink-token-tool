export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { client_id, client_secret } = req.body;

    const authString = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

    const tokenResponse = await fetch("https://api.ic.peplink.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: "grant_type=client_credentials"
    });

    // Read raw text only
    const tokenText = await tokenResponse.text();

    // Always return the raw text, no parsing
    res.status(tokenResponse.status).json({
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      rawResponse: tokenText
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error",
      message: err.message,
      stack: err.stack
    });
  }
}
