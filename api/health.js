export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({ 
    status: 'API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: process.env.DATABASE_URL ? 'configured' : 'missing'
  });
}
