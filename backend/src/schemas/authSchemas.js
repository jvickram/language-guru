const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(80).optional(),
  name: Joi.string().trim().min(2).max(80).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().trim().max(80).optional(),
  targetRole: Joi.string().trim().max(80).optional(),
})
  .or('username', 'name')
  .messages({
    'object.missing': 'Either username or name is required',
  });

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().trim().max(80).optional(),
  targetRole: Joi.string().trim().max(80).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
