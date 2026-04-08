export const checkIsOverdue = (deadline) => {
  if (!deadline) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Handle both ISO string (2026-04-12T00:00:00.000Z) and YYYY-MM-DD format
  let deadlineDate;
  if (deadline.includes('T')) {
    // ISO string format
    deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
  } else {
    // YYYY-MM-DD format
    const [year, month, day] = deadline.split('-');
    deadlineDate = new Date(year, month - 1, day);
  }
  
  return deadlineDate < today;
};
