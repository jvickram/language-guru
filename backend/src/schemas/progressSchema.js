const Joi = require('joi');

const progressSchema = Joi.object({
  lessonId: Joi.string().required(),
  completed: Joi.boolean().default(true),
  score: Joi.number().min(0).max(100).default(0),
});

module.exports = {
  progressSchema,
};
