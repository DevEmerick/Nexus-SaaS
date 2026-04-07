import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  prisma.user.findMany({ take: 10 }).then(users => {
    res.status(200).json({ success: true, count: users.length, users });
  }).catch(error => {
    res.status(500).json({ error: error.message });
  });
}

