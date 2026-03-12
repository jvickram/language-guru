const { signToken, sanitizeUser } = require('../services/authService');
const jwt = require('jsonwebtoken');

describe('authService', () => {
  test('sanitizeUser returns compatibility aliases', () => {
    const user = {
      id: 'u1',
      username: 'demo',
      email: 'demo@example.com',
      role: 'Software Engineer',
      createdAt: '2026-01-01T00:00:00.000Z',
      passwordHash: 'hidden',
    };

    const sanitized = sanitizeUser(user);

    expect(sanitized).toEqual({
      id: 'u1',
      username: 'demo',
      name: 'demo',
      email: 'demo@example.com',
      role: 'Software Engineer',
      targetRole: 'Software Engineer',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(sanitized.passwordHash).toBeUndefined();
  });

  test('signToken signs user identity with configured secret', () => {
    const token = signToken(
      { id: 'u1', email: 'demo@example.com' },
      { jwtSecret: 'test-secret', jwtExpiresIn: '1h' },
    );

    const decoded = jwt.verify(token, 'test-secret');
    expect(decoded.sub).toBe('u1');
    expect(decoded.email).toBe('demo@example.com');
  });
});
