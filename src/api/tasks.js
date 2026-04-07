import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET - Listar tasks de um workspace
router.get('/workspace/:workspaceId', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { 
        workspaceId: req.params.workspaceId,
        deletedAt: null 
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar nova task
router.post('/', async (req, res) => {
  try {
    const { title, description, workspaceId, columnId, priority } = req.body;
    
    if (!title || !workspaceId || !columnId) {
      return res.status(400).json({ error: 'title, workspaceId e columnId são obrigatórios' });
    }

    const task = await prisma.task.create({
      data: { 
        title, 
        description: description || null,
        workspaceId, 
        columnId,
        priority: priority || 'Média'
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obter uma task
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    });

    if (!task) return res.status(404).json({ error: 'Task não encontrada' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Atualizar task
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, columnId, priority, cardColor, completionComment, deadline, tags, assignedTo } = req.body;
    
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : undefined,
        columnId: columnId || undefined,
        priority: priority || undefined,
        cardColor: cardColor || undefined,
        completionComment: completionComment ? completionComment.trim() : undefined,
        deadline: deadline || undefined,
        tags: tags || undefined,
        assignedTo: assignedTo || undefined
      }
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Marcar task como deletada (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Task deletada', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
