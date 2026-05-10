import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:1234';

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@vokasi.id', password: 'Demo1234!' }),
      });
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.user).toBeDefined();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('student@vokasi.id');
      expect(data.user.role).toBe('student');
    });

    it('should reject invalid credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@vokasi.id', password: 'wrongpassword' }),
      });
      
      expect(res.status).toBe(401);
    });

    it('should reject missing credentials', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      expect(res.status).toBe(400);
    });

    it('should login as admin', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@vokasi.id', password: 'Demo1234!' }),
      });
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.user.role).toBe('admin');
    });

    it('should login as instructor', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'instructor@vokasi.id', password: 'Demo1234!' }),
      });
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.user.role).toBe('instructor');
    });

    it('should login as mentor', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'mentor@vokasi.id', password: 'Demo1234!' }),
      });
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.user.role).toBe('mentor');
    });
  });

  describe('GET /api/portfolio', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await fetch(`${BASE_URL}/api/portfolio`);
      const data = await res.json();
      
      expect(res.status).toBe(401);
    });

    it('should return portfolio data for authenticated user', async () => {
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@vokasi.id', password: 'Demo1234!' }),
      });
      const { token } = await loginRes.json();

      const res = await fetch(`${BASE_URL}/api/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.competencies).toBeDefined();
      expect(data.artifacts).toBeDefined();
      expect(data.endorsements).toBeDefined();
    });
  });
});
