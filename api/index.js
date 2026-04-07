// Vercel Serverless Handler para /api/*

export default function handler(req, res) {
  const path = req.url.split('?')[0]; // Remove query params
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check  
  if (path === '/api/health' || path === '/api') {
    return res.status(200).json({ 
      status: 'API running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      database: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }
  
  if (path === '/api/status') {
    return res.status(200).json({
      status: 'API is operational',
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? 'connected' : 'not configured'
    });
  }

  // Placeholder para outras rotas
  return res.status(200).json({ 
    message: 'API is running',
    path: path,
    method: req.method
  });
}
