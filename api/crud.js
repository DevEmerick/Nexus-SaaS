import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const path = req.url.split('?')[0];

  // /api/crud?action=getUsers
  if (path === '/api/crud') {
    const action = req.query?.action;

    if (action === 'getUsers') {
      return prisma.user.findMany({ take: 10 }).then(users => {
        res.status(200).json({ success: true, count: users.length, users });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    if (action === 'getWorkspaces') {
      return prisma.workspace.findMany({ 
        take: 10,
        include: { columns: true, tasks: true }
      }).then(workspaces => {
        res.status(200).json({ success: true, count: workspaces.length, workspaces });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    if (action === 'getColumns') {
      return prisma.column.findMany({ 
        take: 10,
        include: { tasks: true }
      }).then(columns => {
        res.status(200).json({ success: true, count: columns.length, columns });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    if (action === 'getTasks') {
      return prisma.task.findMany({ take: 20 }).then(tasks => {
        res.status(200).json({ success: true, count: tasks.length, tasks });
      }).catch(error => {
        res.status(500).json({ error: error.message });
      });
    }

    return res.status(400).json({ error: 'Invalid action', available: ['getUsers', 'getWorkspaces', 'getColumns', 'getTasks'] });
  }

  return res.status(404).json({ error: 'Not found' });
}
