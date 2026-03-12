const bcrypt = require('bcryptjs');
const { CORE_LESSONS } = require('../content/lessons');
const { now } = require('../utils/time');

const createMemoryStore = () => {
  const state = {
    users: [
      {
        id: 'u_demo',
        username: 'demo',
        email: 'demo@languageguru.app',
        role: 'Software Engineer',
        passwordHash: bcrypt.hashSync('demo1234', 10),
        createdAt: now(),
      },
    ],
    lessons: CORE_LESSONS.map((lesson) => ({ ...lesson, createdBy: 'system', createdAt: now() })),
    progress: [],
  };

  return {
    mode: 'memory',
    ready: async () => true,
    findUserByEmail: async (email) => state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
    findUserById: async (id) => state.users.find((u) => u.id === id) || null,
    createUser: async (payload) => {
      const user = {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...payload,
        createdAt: now(),
      };
      state.users.push(user);
      return user;
    },
    updateUserRole: async (id, role) => {
      const user = state.users.find((u) => u.id === id);
      if (!user) return null;
      user.role = role;
      return user;
    },
    getLessons: async (filters = {}) => {
      return state.lessons.filter((lesson) => {
        if (filters.trackId && lesson.trackId !== filters.trackId) return false;
        if (filters.language && lesson.language !== filters.language) return false;
        if (filters.level && lesson.level !== filters.level) return false;
        return true;
      });
    },
    getLessonById: async (id) => state.lessons.find((l) => l.id === id) || null,
    getProgressForUser: async (userId) => state.progress.filter((p) => p.userId === userId),
    upsertProgress: async ({ userId, lessonId, completed, score }) => {
      const existing = state.progress.find((p) => p.userId === userId && p.lessonId === lessonId);
      if (existing) {
        existing.completed = Boolean(completed);
        existing.score = Number(score);
        existing.updatedAt = now();
        return existing;
      }

      const record = {
        userId,
        lessonId,
        completed: Boolean(completed),
        score: Number(score),
        updatedAt: now(),
      };
      state.progress.push(record);
      return record;
    },
  };
};

module.exports = {
  createMemoryStore,
};
