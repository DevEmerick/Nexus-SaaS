import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    const { name, workspaceId, status } = JSON.parse(req.body || '{}');
    
    if (!name || !workspaceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    prisma.column.create({
      data: { name, workspaceId, status: status || 'ACTIVE' },
    }).then(column => {
      res.status(201).json({ success: true, column });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else if (req.method === 'GET') {
    prisma.column.findMany({ 
      take: 10,
      include: { tasks: true }
    }).then(columns => {
      res.status(200).json({ success: true, columns });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
