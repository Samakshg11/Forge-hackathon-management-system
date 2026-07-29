import { describe, it, expect } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Security Operations', () => {
  it('should hash and verify passwords with bcrypt', async () => {
    const password = 'Password123!';
    const hash = await bcrypt.hash(password, 12);

    expect(hash).not.toBe(password);
    const valid = await bcrypt.compare(password, hash);
    expect(valid).toBe(true);

    const invalid = await bcrypt.compare('WrongPassword', hash);
    expect(invalid).toBe(false);
  });

  it('should sign and verify JWT access tokens', () => {
    const secret = 'test_secret_key_1234567890_min_32_bytes';
    const payload = { sub: '507f1f77bcf86cd799439011', role: 'ORGANIZER' };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });

    const decoded = jwt.verify(token, secret);
    expect(decoded.sub).toBe('507f1f77bcf86cd799439011');
    expect(decoded.role).toBe('ORGANIZER');
  });
});
