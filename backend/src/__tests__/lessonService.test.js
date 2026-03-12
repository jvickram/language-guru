const { toLessonResponse, buildTrackStats, formatProgress } = require('../services/lessonService');

describe('lessonService', () => {
  test('toLessonResponse merges completion and score', () => {
    const lesson = { id: 'l1', title: 'Test Lesson' };
    const progressMap = new Map([['l1', { completed: true, score: 87 }]]);

    expect(toLessonResponse(lesson, progressMap)).toEqual({
      id: 'l1',
      title: 'Test Lesson',
      completed: true,
      score: 87,
    });
  });

  test('buildTrackStats calculates completion and average score', () => {
    const lessons = [
      { id: 'l1', trackId: 't1', trackName: 'Track 1' },
      { id: 'l2', trackId: 't1', trackName: 'Track 1' },
      { id: 'l3', trackId: 't2', trackName: 'Track 2' },
    ];

    const progress = [
      { lessonId: 'l1', completed: true, score: 80 },
      { lessonId: 'l2', completed: false, score: 60 },
      { lessonId: 'l3', completed: true, score: 100 },
    ];

    const tracks = buildTrackStats(lessons, progress);
    const t1 = tracks.find((t) => t.trackId === 't1');
    const t2 = tracks.find((t) => t.trackId === 't2');

    expect(t1.totalLessons).toBe(2);
    expect(t1.completedLessons).toBe(1);
    expect(t1.averageScore).toBe(70);

    expect(t2.totalLessons).toBe(1);
    expect(t2.completedLessons).toBe(1);
    expect(t2.averageScore).toBe(100);
  });

  test('formatProgress returns normalized response shape', () => {
    const formatted = formatProgress([{ lessonId: 'l1', completed: 1, score: '92', updatedAt: 'now' }]);

    expect(formatted).toEqual([
      {
        lessonId: 'l1',
        completed: true,
        score: 92,
        updatedAt: 'now',
      },
    ]);
  });
});
