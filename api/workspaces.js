import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  prisma.workspace.findMany({ 
    take: 10,
    include: { columns: true, tasks: true }
  }).then(workspaces => {
    res.status(200).json({ success: true, count: workspaces.length, workspaces });
  }).catch(error => {
    res.status(500).json({ error: error.message });
  });
}

