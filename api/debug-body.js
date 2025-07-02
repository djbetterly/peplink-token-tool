export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
      json: true
    }
  }
};

export default async function handler(req, res) {
  return res.status(200).json({
    method: req.method,
    body: req.body
  });
}
