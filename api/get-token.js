export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { client_id, client_secret } = req.body;

  const authString = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  const response = await fetch("https://api.ic.peplink.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!response.ok) {
    res.status(response.status).json(data);
    return;
  }

  res.status(200).json(data);
}

