import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  prisma.column.findMany({ 
    take: 10,
    include: { tasks: true }
  }).then(columns => {
    res.status(200).json({ success: true, count: columns.length, columns });
  }).catch(error => {
    res.status(500).json({ error: error.message });
  });
}
