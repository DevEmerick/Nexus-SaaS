import 'dotenv/config.js';
import { prisma } from '../src/lib/prisma.js';

const workspaceId = 'cmnoy4o3p0002ehssk3tnlk5w';

try {
  const column = await prisma.column.create({
    data: {
      title: 'A Fazer',
      color: '#3B82F6',
      position: 1,
      workspaceId: workspaceId
    }
  });
  console.log(JSON.stringify(column, null, 2));
} catch (error) {
  console.error('Erro:', error.message);
} finally {
  await prisma.$disconnect();
}
