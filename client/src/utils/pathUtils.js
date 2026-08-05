export function calculateProgress(path) {
  if (!path) return 0;
  if (path.status === 'completed') return 100;
  if (!path.roadmap || path.roadmap.length === 0) return 0;
  
  const completedCount = path.roadmap.filter((m) => m.completed).length;
  const totalCount = path.roadmap.length;

  if (completedCount >= totalCount) return 100;
  
  return Math.round((completedCount / totalCount) * 100);
}

export function calculateTimelineStats(path) {
  if (!path) {
    return {
      targetDurationText: '6 Months',
      targetCompletionDate: new Date(),
      daysRemaining: 0,
      timeRemainingText: '0 days',
      timeElapsedText: '0 months',
      estimatedWeeklyHours: 20,
      currentPace: 'On Track',
      timelineHealth: '🟢 On Track',
    };
  }

  const durationNum = path.targetDuration || path.estimatedMonths || 6;
  const durationUnit = path.durationUnit || 'Months';
  const targetDurationText = `${durationNum} ${durationUnit}`;

  const createdDate = path.createdAt ? new Date(path.createdAt) : new Date();
  const totalDurationDays = durationUnit === 'Years' ? durationNum * 365 : durationNum * 30;

  const targetDate = path.targetCompletionDate
    ? new Date(path.targetCompletionDate)
    : new Date(createdDate.getTime() + totalDurationDays * 86400000);

  const now = new Date();
  const timeRemainingMs = targetDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24)));
  
  const timeElapsedMs = Math.max(0, now.getTime() - createdDate.getTime());
  const daysElapsed = Math.floor(timeElapsedMs / (1000 * 60 * 60 * 24));
  const monthsElapsed = Math.floor(daysElapsed / 30);

  let timeRemainingText = '';
  if (daysRemaining > 60) {
    timeRemainingText = `${Math.round(daysRemaining / 30)} months left`;
  } else {
    timeRemainingText = `${daysRemaining} days left`;
  }

  const timeElapsedText = monthsElapsed > 0 ? `${monthsElapsed} mo elapsed` : `${daysElapsed} days elapsed`;

  const totalMilestones = path.roadmap ? path.roadmap.length : 1;
  const completedMilestones = path.roadmap ? path.roadmap.filter((m) => m.completed).length : 0;
  const milestoneProgress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
  const timeProgress = totalDurationDays > 0 ? Math.min(1, daysElapsed / totalDurationDays) : 0;

  let currentPace = 'On Track';
  if (path.status === 'completed' || milestoneProgress === 1) {
    currentPace = 'On Track';
  } else if (milestoneProgress >= timeProgress + 0.15) {
    currentPace = 'Ahead of Schedule';
  } else if (milestoneProgress >= timeProgress - 0.1) {
    currentPace = 'On Track';
  } else if (milestoneProgress >= timeProgress - 0.25) {
    currentPace = 'Slightly Behind';
  } else {
    currentPace = 'Behind Schedule';
  }

  let timelineHealth = '🟢 On Track';
  if (path.status === 'completed' || milestoneProgress === 1) {
    timelineHealth = '🟢 On Track';
  } else if (currentPace === 'Ahead of Schedule' || currentPace === 'On Track') {
    timelineHealth = '🟢 On Track';
  } else if (currentPace === 'Slightly Behind') {
    timelineHealth = '🟡 Needs Faster Progress';
  } else {
    timelineHealth = '🔴 High Risk of Missing Deadline';
  }

  return {
    targetDurationText,
    targetCompletionDate: targetDate,
    targetCompletionDateText: targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    daysRemaining,
    timeRemainingText,
    timeElapsedText,
    daysElapsed,
    estimatedWeeklyHours: path.estimatedWeeklyHours || 20,
    currentPace,
    timelineHealth,
  };
}
