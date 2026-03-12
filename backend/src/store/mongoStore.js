const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { CORE_LESSONS } = require('../content/lessons');
const { now } = require('../utils/time');

const createMongoStore = async (config) => {
  await mongoose.connect(config.mongoUri, {
    autoIndex: true,
    maxPoolSize: 10,
  });

  const userSchema = new mongoose.Schema(
    {
      username: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },
      role: { type: String, default: 'Software Engineer' },
      passwordHash: { type: String, required: true },
      createdAt: { type: String, required: true },
    },
    { versionKey: false },
  );

  const lessonSchema = new mongoose.Schema(
    {
      id: { type: String, required: true, unique: true, index: true },
      trackId: String,
      trackName: String,
      title: String,
      content: String,
      language: String,
      level: String,
      estimatedMinutes: Number,
      quiz: Array,
      createdBy: String,
      createdAt: String,
    },
    { versionKey: false },
  );

  const progressSchema = new mongoose.Schema(
    {
      userId: { type: String, required: true, index: true },
      lessonId: { type: String, required: true, index: true },
      completed: Boolean,
      score: Number,
      updatedAt: String,
    },
    { versionKey: false },
  );

  progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
  const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

  const lessonCount = await Lesson.countDocuments();
  if (lessonCount === 0) {
    await Lesson.insertMany(CORE_LESSONS.map((lesson) => ({ ...lesson, createdBy: 'system', createdAt: now() })));
  }

  const demoUser = await User.findOne({ email: 'demo@languageguru.app' });
  if (!demoUser) {
    await User.create({
      username: 'demo',
      email: 'demo@languageguru.app',
      role: 'Software Engineer',
      passwordHash: bcrypt.hashSync('demo1234', 10),
      createdAt: now(),
    });
  }

  return {
    mode: 'mongo',
    ready: async () => mongoose.connection.readyState === 1,
    findUserByEmail: async (email) => {
      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      return user
        ? {
            id: String(user._id),
            username: user.username,
            email: user.email,
            role: user.role,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
          }
        : null;
    },
    findUserById: async (id) => {
      const user = await User.findById(id).lean();
      return user
        ? {
            id: String(user._id),
            username: user.username,
            email: user.email,
            role: user.role,
            passwordHash: user.passwordHash,
            createdAt: user.createdAt,
          }
        : null;
    },
    createUser: async (payload) => {
      const doc = await User.create({
        username: payload.username,
        email: payload.email.toLowerCase(),
        role: payload.role,
        passwordHash: payload.passwordHash,
        createdAt: now(),
      });

      return {
        id: String(doc._id),
        username: doc.username,
        email: doc.email,
        role: doc.role,
        passwordHash: doc.passwordHash,
        createdAt: doc.createdAt,
      };
    },
    updateUserRole: async (id, role) => {
      const doc = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
      return doc
        ? {
            id: String(doc._id),
            username: doc.username,
            email: doc.email,
            role: doc.role,
            passwordHash: doc.passwordHash,
            createdAt: doc.createdAt,
          }
        : null;
    },
    getLessons: async (filters = {}) => {
      const query = {};
      if (filters.trackId) query.trackId = filters.trackId;
      if (filters.language) query.language = filters.language;
      if (filters.level) query.level = filters.level;
      return Lesson.find(query).lean();
    },
    getLessonById: async (id) => Lesson.findOne({ id }).lean(),
    getProgressForUser: async (userId) => Progress.find({ userId }).lean(),
    upsertProgress: async ({ userId, lessonId, completed, score }) => {
      return Progress.findOneAndUpdate(
        { userId, lessonId },
        { userId, lessonId, completed: Boolean(completed), score: Number(score), updatedAt: now() },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();
    },
  };
};

module.exports = {
  createMongoStore,
};
