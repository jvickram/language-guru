const toLessonResponse = (lesson, userProgressMap) => {
  const progressRecord = userProgressMap.get(lesson.id);
  return {
    ...lesson,
    completed: Boolean(progressRecord && progressRecord.completed),
    score: progressRecord ? progressRecord.score : null,
  };
};

const buildTrackStats = (lessons, progress) => {
  const progressMap = new Map(progress.map((p) => [p.lessonId, p]));
  const trackMap = new Map();

  for (const lesson of lessons) {
    const key = lesson.trackId || 'general';
    const current = trackMap.get(key) || {
      trackId: key,
      trackName: lesson.trackName || 'General',
      totalLessons: 0,
      completedLessons: 0,
      averageScore: 0,
      totalScore: 0,
      scoredCount: 0,
    };

    current.totalLessons += 1;
    const progressRecord = progressMap.get(lesson.id);
    if (progressRecord && progressRecord.completed) current.completedLessons += 1;
    if (progressRecord && typeof progressRecord.score === 'number') {
      current.totalScore += progressRecord.score;
      current.scoredCount += 1;
    }

    trackMap.set(key, current);
  }

  return Array.from(trackMap.values()).map((track) => ({
    ...track,
    averageScore: track.scoredCount > 0 ? Math.round(track.totalScore / track.scoredCount) : 0,
  }));
};

const formatProgress = (progress) =>
  progress.map((p) => ({
    lessonId: p.lessonId,
    completed: Boolean(p.completed),
    score: Number(p.score),
    updatedAt: p.updatedAt,
  }));

module.exports = {
  toLessonResponse,
  buildTrackStats,
  formatProgress,
};
