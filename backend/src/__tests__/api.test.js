const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../app');

const buildStoreManager = () => {
  const state = {
    users: [
      {
        id: 'u_demo',
        username: 'demo',
        email: 'demo@languageguru.app',
        role: 'Software Engineer',
        passwordHash: bcrypt.hashSync('demo1234', 10),
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    lessons: [
      {
        id: 'l1',
        trackId: 'confidence_10min',
        trackName: 'Speak confidently in 10 minutes',
        title: 'Confidence drill',
        content: 'Practice short responses',
        language: 'English',
        level: 'Starter',
      },
    ],
    progress: [],
  };

  const store = {
    mode: 'memory',
    ready: async () => true,
    findUserByEmail: async (email) => state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
    findUserById: async (id) => state.users.find((u) => u.id === id) || null,
    createUser: async (payload) => {
      const newUser = {
        id: `u_${state.users.length + 1}`,
        ...payload,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      state.users.push(newUser);
      return newUser;
    },
    updateUserRole: async (id, role) => {
      const user = state.users.find((u) => u.id === id);
      if (!user) return null;
      user.role = role;
      return user;
    },
    getLessons: async () => state.lessons,
    getLessonById: async (id) => state.lessons.find((l) => l.id === id) || null,
    getProgressForUser: async (userId) => state.progress.filter((p) => p.userId === userId),
    upsertProgress: async ({ userId, lessonId, completed, score }) => {
      const existing = state.progress.find((p) => p.userId === userId && p.lessonId === lessonId);
      if (existing) {
        existing.completed = completed;
        existing.score = score;
        existing.updatedAt = '2026-01-01T00:00:00.000Z';
        return existing;
      }

      const record = {
        userId,
        lessonId,
        completed,
        score,
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      state.progress.push(record);
      return record;
    },
  };

  return {
    getStore: () => store,
    getMode: () => store.mode,
  };
};

describe('API routes', () => {
  const config = {
    env: 'test',
    port: 3000,
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    dataStore: 'memory',
    mongoUri: '',
    requestLimit: 5000,
    allowedOrigins: ['*'],
  };

  test('register supports name + targetRole payload and returns compatibility aliases', async () => {
    const app = createApp({ config, storeManager: buildStoreManager() });

    const response = await request(app).post('/api/auth/register').send({
      email: 'new.user@example.com',
      password: 'Passw0rd!',
      name: 'New User',
      targetRole: 'Data Analyst',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.username).toBe('New User');
    expect(response.body.user.name).toBe('New User');
    expect(response.body.user.role).toBe('Data Analyst');
    expect(response.body.user.targetRole).toBe('Data Analyst');
    expect(response.body.token).toBeTruthy();
  });

  test('login accepts targetRole and updates role', async () => {
    const app = createApp({ config, storeManager: buildStoreManager() });

    const response = await request(app).post('/api/auth/login').send({
      email: 'demo@languageguru.app',
      password: 'demo1234',
      targetRole: 'Product Manager',
    });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe('Product Manager');
    expect(response.body.user.targetRole).toBe('Product Manager');
  });

  test('lessons and progress are protected and work with bearer token', async () => {
    const app = createApp({ config, storeManager: buildStoreManager() });

    const unauthorized = await request(app).get('/api/lessons');
    expect(unauthorized.status).toBe(401);

    const login = await request(app).post('/api/auth/login').send({
      email: 'demo@languageguru.app',
      password: 'demo1234',
    });

    const token = login.body.token;

    const lessons = await request(app).get('/api/lessons').set('Authorization', `Bearer ${token}`);
    expect(lessons.status).toBe(200);
    expect(Array.isArray(lessons.body.lessons)).toBe(true);
    expect(lessons.body.lessons[0].id).toBe('l1');

    const progress = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ lessonId: 'l1', completed: true, score: 95 });

    expect(progress.status).toBe(201);
    expect(progress.body.progress[0].lessonId).toBe('l1');
    expect(progress.body.progress[0].score).toBe(95);
  });
});
