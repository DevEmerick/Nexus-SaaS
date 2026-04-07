export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    success: true,
    message: 'Test endpoint responded',
    timestamp: new Date().toISOString(),
    method: req.method,
  });
}
