import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import authRouter from './auth.js';
import usersRouter from './users.js';
import workspacesRouter from './workspaces.js';
import columnsRouter from './columns.js';
import tasksRouter from './tasks.js';
import { authMiddleware } from './utils/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Health check (sem autenticação)
app.get('/api/health', (req, res) => {
  res.json({ status: 'API running' });
});

// Rotas de Autenticação (sem autenticação requerida)
app.use('/api/auth', authRouter);

// Rotas Protegidas (requerem JWT)
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/workspaces', authMiddleware, workspacesRouter);
app.use('/api/columns', authMiddleware, columnsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   GET  /api/users`);
  console.log(`   POST /api/users`);
  console.log(`   GET  /api/workspaces/user/:userId`);
  console.log(`   POST /api/workspaces`);
  console.log(`   GET  /api/tasks/workspace/:workspaceId`);
  console.log(`   POST /api/tasks`);
});
