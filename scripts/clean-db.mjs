import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🗑️  Limpando banco de dados...');
  
  try {
    // Deletar todas as tasks
    const tasksDeleted = await prisma.task.deleteMany();
    console.log(`✓ ${tasksDeleted.count} tasks deletadas`);

    // Deletar todas as colunas
    const columnsDeleted = await prisma.column.deleteMany();
    console.log(`✓ ${columnsDeleted.count} colunas deletadas`);

    // Deletar todos os workspaces
    const workspacesDeleted = await prisma.workspace.deleteMany();
    console.log(`✓ ${workspacesDeleted.count} workspaces deletados`);

    // Deletar todos os usuários
    const usersDeleted = await prisma.user.deleteMany();
    console.log(`✓ ${usersDeleted.count} usuários deletados`);

    console.log('\n✅ Banco de dados limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
