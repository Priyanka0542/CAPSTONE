export function calculateProgress(path) {
  if (!path) return 0;
  if (path.status === 'completed') return 100;
  if (!path.roadmap || path.roadmap.length === 0) return 0;
  
  const completedCount = path.roadmap.filter((m) => m.completed).length;
  const totalCount = path.roadmap.length;

  if (completedCount >= totalCount) return 100;
  
  return Math.round((completedCount / totalCount) * 100);
}
