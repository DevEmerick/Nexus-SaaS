import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    const { title, columnId, status } = JSON.parse(req.body || '{}');
    
    if (!title || !columnId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    prisma.task.create({
      data: { title, columnId, status: status || 'TODO' },
    }).then(task => {
      res.status(201).json({ success: true, task });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else if (req.method === 'GET') {
    prisma.task.findMany({ take: 20 }).then(tasks => {
      res.status(200).json({ success: true, tasks });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
