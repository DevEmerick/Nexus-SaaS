import { checkIsOverdue } from '../utils/validation';

export const useUtilityFunctions = (
  taskForm,
  users,
  wsTasks
) => {

  const reverseHistory = () => {
    return [...(taskForm.history || [])].reverse();
  };

  const getUserDetails = (uid) => users.find(u => u.id === uid) || { name: 'Usuário Removido', avatar: '' };

  const calculateDashboardMetrics = (tasks) => {
    const totalT = tasks.length;
    const completedT = tasks.filter(t => t.status === 'done').length;
    const inProgressT = tasks.filter(t => t.status !== 'done' && t.status !== 'todo').length;
    const overdueT = tasks.filter(t => t.status !== 'done' && checkIsOverdue(t.deadline)).length;
    const completionRate = totalT === 0 ? 0 : Math.round((completedT / totalT) * 100);

    const workDistribution = [
      { status: 'todo', value: tasks.filter(t => t.status === 'todo').length },
      { status: 'doing', value: inProgressT },
      { status: 'done', value: completedT }
    ];

    return { completed: completedT, inProgress: inProgressT, overdue: overdueT, total: totalT, completionRate, workDistribution };
  };

  return {
    reverseHistory,
    getUserDetails,
    calculateDashboardMetrics
  };
};
