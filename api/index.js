import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import authRouter from '../../src/api/auth.js';
import usersRouter from '../../src/api/users.js';
import workspacesRouter from '../../src/api/workspaces.js';
import columnsRouter from '../../src/api/columns.js';
import tasksRouter from '../../src/api/tasks.js';
import { authMiddleware } from '../../src/api/utils/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Health check (sem autenticação)
app.get('/health', (req, res) => {
  res.json({ status: 'API running', timestamp: new Date().toISOString() });
});

// Get status
app.get('/status', (req, res) => {
  res.json({ 
    status: 'API is operational',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Rotas de Autenticação (sem autenticação requerida)
app.use('/api/auth', authRouter);

// Rotas Protegidas (requerem JWT)
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/workspaces', authMiddleware, workspacesRouter);
app.use('/api/columns', authMiddleware, columnsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.url}` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Erro do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Para Vercel Serverless
export default app;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ API running on http://localhost:${PORT}`);
    console.log(`📝 API docs: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
}
