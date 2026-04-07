import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    const { email, name, password } = JSON.parse(req.body || '{}');
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    prisma.user.create({
      data: { email, name, password },
    }).then(user => {
      res.status(201).json({ success: true, user });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else if (req.method === 'GET') {
    prisma.user.findMany({ take: 10 }).then(users => {
      res.status(200).json({ success: true, users });
    }).catch(error => {
      res.status(500).json({ error: error.message });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
