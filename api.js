export const config = {
  runtime: 'nodejs18.x',
  maxDuration: 30,
};

export default function handler(req, res) {
  const url = req.url.split('?')[0];
  
  // Set CORS headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check endpoint
  if (url === '/health') {
    return res.status(200).json({
      status: 'API running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }

  // Status endpoint
  if (url === '/status') {
    return res.status(200).json({
      ok: true,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  }

  // Default 404
  return res.status(404).json({ error: 'Not found', path: url });
}
