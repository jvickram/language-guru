const express = require('express');
const { progressSchema } = require('../schemas/progressSchema');
const { toLessonResponse, buildTrackStats, formatProgress } = require('../services/lessonService');

const createLearningRouter = ({ storeManager, authMiddleware }) => {
  const router = express.Router();

  router.get('/tracks', authMiddleware, async (req, res) => {
    const store = storeManager.getStore();
    const lessons = await store.getLessons();
    const progress = await store.getProgressForUser(req.user.id);
    const tracks = buildTrackStats(lessons, progress);
    return res.json({ tracks });
  });

  router.get('/lessons', authMiddleware, async (req, res) => {
    const store = storeManager.getStore();
    const { trackId, level, language } = req.query;
    const lessons = await store.getLessons({ trackId, level, language });
    const progress = await store.getProgressForUser(req.user.id);
    const progressMap = new Map(progress.map((p) => [p.lessonId, p]));
    return res.json({ lessons: lessons.map((l) => toLessonResponse(l, progressMap)) });
  });

  router.get('/lessons/:id', authMiddleware, async (req, res) => {
    const store = storeManager.getStore();
    const lesson = await store.getLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const progress = await store.getProgressForUser(req.user.id);
    const progressMap = new Map(progress.map((p) => [p.lessonId, p]));
    return res.json(toLessonResponse(lesson, progressMap));
  });

  router.post('/progress', authMiddleware, async (req, res) => {
    const { value, error } = progressSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const store = storeManager.getStore();
    const lesson = await store.getLessonById(value.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await store.upsertProgress({
      userId: req.user.id,
      lessonId: value.lessonId,
      completed: value.completed,
      score: Math.max(0, Math.min(100, Number(value.score))),
    });

    const progress = await store.getProgressForUser(req.user.id);
    return res.status(201).json({ progress: formatProgress(progress) });
  });

  router.get('/progress', authMiddleware, async (req, res) => {
    const progress = await storeManager.getStore().getProgressForUser(req.user.id);
    return res.json({ progress: formatProgress(progress) });
  });

  return router;
};

module.exports = {
  createLearningRouter,
};
