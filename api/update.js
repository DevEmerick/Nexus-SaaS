import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, id, ...updateData } = req.body;

    if (!type || !id) {
      return res.status(400).json({
        success: false,
        error: 'type and id are required',
      });
    }

    let result;
    let resultKey;

    switch (type) {
      case 'user':
        result = await prisma.user.update({
          where: { id },
          data: {
            ...(updateData.email && { email: updateData.email }),
            ...(updateData.name && { name: updateData.name }),
            ...(updateData.phone !== undefined && { phone: updateData.phone }),
            ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
            ...(updateData.themePreference && { themePreference: updateData.themePreference }),
          },
        });
        resultKey = 'user';
        break;

      case 'workspace':
        result = await prisma.workspace.update({
          where: { id },
          data: {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.color && { color: updateData.color }),
          },
          include: { user: true, columns: true },
        });
        resultKey = 'workspace';
        break;

      case 'column':
        result = await prisma.column.update({
          where: { id },
          data: {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.color && { color: updateData.color }),
            ...(updateData.position !== undefined && { position: updateData.position }),
          },
          include: { workspace: true, tasks: true },
        });
        resultKey = 'column';
        break;

      case 'task':
        result = await prisma.task.update({
          where: { id },
          data: {
            ...(updateData.title && { title: updateData.title }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.columnId && { columnId: updateData.columnId }),
            ...(updateData.priority && { priority: updateData.priority }),
            ...(updateData.deadline !== undefined && { deadline: updateData.deadline ? new Date(updateData.deadline) : null }),
            ...(updateData.cardColor && { cardColor: updateData.cardColor }),
            ...(updateData.completionComment !== undefined && { completionComment: updateData.completionComment }),
            ...(updateData.assignedTo !== undefined && { assignedTo: updateData.assignedTo }),
            ...(updateData.tags !== undefined && { tags: updateData.tags }),
          },
          include: { column: true },
        });
        resultKey = 'task';
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Invalid type. Must be: user, workspace, column, or task`,
        });
    }

    const response = {
      success: true,
      message: `${type} updated successfully`,
      timestamp: new Date().toISOString(),
    };
    response[resultKey] = result;

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error updating:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}
