import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  prisma.task.findMany({ take: 20 }).then(tasks => {
    res.status(200).json({ success: true, count: tasks.length, tasks });
  }).catch(error => {
    res.status(500).json({ error: error.message });
  });
}
