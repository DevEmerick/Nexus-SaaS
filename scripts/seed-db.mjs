import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Populando banco de dados...\n');
  
  try {
    // 1. Criar usuário
    console.log('👤 Criando usuário...');
    const hashedPassword = await bcrypt.hash('emerick', 10);
    const user = await prisma.user.create({
      data: {
        email: 'emerick@gmail.com',
        name: 'Emerick',
        password: hashedPassword,
        phone: '(11) 99999-9999',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emerick',
        themePreference: 'dark',
      },
    });
    console.log(`✓ Usuário criado: ${user.name} (${user.email})\n`);

    // 2. Criar Workspace
    console.log('📊 Criando workspace...');
    const workspace = await prisma.workspace.create({
      data: {
        title: 'Projeto Nexus',
        color: '#6366f1',
        userId: user.id,
      },
    });
    console.log(`✓ Workspace criado: ${workspace.title}\n`);

    // 3. Criar Colunas
    console.log('📋 Criando colunas...');
    const columns = await Promise.all([
      prisma.column.create({
        data: {
          title: 'To Do',
          color: '#ef4444',
          workspaceId: workspace.id,
          position: 0,
        },
      }),
      prisma.column.create({
        data: {
          title: 'In Progress',
          color: '#f59e0b',
          workspaceId: workspace.id,
          position: 1,
        },
      }),
      prisma.column.create({
        data: {
          title: 'Done',
          color: '#10b981',
          workspaceId: workspace.id,
          position: 2,
        },
      }),
    ]);
    console.log(`✓ ${columns.length} colunas criadas: ${columns.map(c => c.title).join(', ')}\n`);

    // 4. Criar Tasks (Cards)
    console.log('🎯 Criando tasks e comentários...');

    // To Do Column
    const task1 = await prisma.task.create({
      data: {
        title: 'Implementar autenticação JWT',
        description: 'Adicionar sistema de login com tokens JWT e refresh tokens',
        workspaceId: workspace.id,
        columnId: columns[0].id,
        priority: 'Alta',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        cardColor: 'red',
        completionComment: 'Aguardando review de segurança',
        assignedTo: 'Emerick',
        tags: 'backend,security',
      },
    });

    const task2 = await prisma.task.create({
      data: {
        title: 'Criar documentação da API',
        description: 'Documentar todos os endpoints com exemplos de request/response',
        workspaceId: workspace.id,
        columnId: columns[0].id,
        priority: 'Média',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        cardColor: 'yellow',
        assignedTo: 'Emerick',
        tags: 'documentation,api',
      },
    });

    // In Progress Column
    const task3 = await prisma.task.create({
      data: {
        title: 'Refatorar componentes React',
        description: 'Converter componentes de classe para hooks functional components',
        workspaceId: workspace.id,
        columnId: columns[1].id,
        priority: 'Média',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        cardColor: 'blue',
        completionComment: 'Em progresso - 70% completo',
        assignedTo: 'Emerick',
        tags: 'frontend,refactor',
      },
    });

    const task4 = await prisma.task.create({
      data: {
        title: 'Otimizar queries do banco de dados',
        description: 'Adicionar índices e otimizar queries lentas',
        workspaceId: workspace.id,
        columnId: columns[1].id,
        priority: 'Alta',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        cardColor: 'orange',
        assignedTo: 'Emerick',
        tags: 'database,performance',
      },
    });

    // Done Column
    const task5 = await prisma.task.create({
      data: {
        title: 'Setup do projeto inicial',
        description: 'Configurar package.json, tsconfig, eslint e prettier',
        workspaceId: workspace.id,
        columnId: columns[2].id,
        priority: 'Alta',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Passado
        cardColor: 'green',
        completionComment: '✅ Completo - Todos os linters e formatters configurados',
        assignedTo: 'Emerick',
        tags: 'setup,devops',
      },
    });

    const task6 = await prisma.task.create({
      data: {
        title: 'Implementar Sistema CRUD de APIs',
        description: 'Criar endpoints para CREATE, READ, UPDATE, DELETE de todos os recursos',
        workspaceId: workspace.id,
        columnId: columns[2].id,
        priority: 'Alta',
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        cardColor: 'emerald',
        completionComment: '✅ Completo - Todos os 10 handlers deployados e testados com 15/15 testes passando',
        assignedTo: 'Emerick',
        tags: 'api,crud,testing',
      },
    });

    const task7 = await prisma.task.create({
      data: {
        title: 'Testes abrangentes da API',
        description: 'Criar testes para todos os CRUD operations com jq parsing',
        workspaceId: workspace.id,
        columnId: columns[2].id,
        priority: 'Média',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        cardColor: 'emerald',
        completionComment: '✅ Completo - Script test-comprehensive-crud.sh com 15 testes passando',
        assignedTo: 'Emerick',
        tags: 'testing,api',
      },
    });

    console.log(`✓ Total de ${task1.id ? 7 : 0} tasks criadas\n`);

    // Exibir resumo
    console.log('=' .repeat(50));
    console.log('✅ BANCO DE DADOS POPULADO COM SUCESSO!\n');
    console.log('📊 Resumo:');
    console.log(`   • Usuário: ${user.name} (${user.email})`);
    console.log(`   • Workspace: ${workspace.title}`);
    console.log(`   • Colunas: ${columns.map(c => c.title).join(', ')}`);
    console.log(`   • Tasks Total: 7`);
    console.log('     - To Do: 2 tasks (vermelho/amarelo)');
    console.log('     - In Progress: 2 tasks (azul/laranja)');
    console.log('     - Done: 3 tasks (tudo verde) ✓');
    console.log('\n💡 Dica: Use este fluxo para testar a UI do Nexus!');
    console.log('=' .repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
