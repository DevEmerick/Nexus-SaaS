export const checkIsOverdue = (deadline) => {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = deadline.split('-');
  return new Date(year, month - 1, day) < today;
};
