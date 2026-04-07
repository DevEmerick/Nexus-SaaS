import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    const { name, ownerId } = JSON.parse(req.body || '{}');
    
    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    prisma.workspace.create({
      data: { name, ownerId },
    }).then(workspace => {
      res.status(201).json({ success: true, workspace });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else if (req.method === 'GET') {
    prisma.workspace.findMany({ 
      take: 10,
      include: { columns: true, tasks: true }
    }).then(workspaces => {
      res.status(200).json({ success: true, workspaces });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
