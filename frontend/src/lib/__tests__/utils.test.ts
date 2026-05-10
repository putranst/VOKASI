import { describe, it, expect } from 'vitest';

// Test utility functions
describe('Auth Utils', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@vokasi.id')).toBe(true);
      expect(isValidEmail('admin@school.edu')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate passwords with 8+ chars', () => {
      expect(isValidPassword('Demo1234!')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('12345678')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('formatRole', () => {
    it('should format roles correctly', () => {
      expect(formatRole('student')).toBe('Student');
      expect(formatRole('instructor')).toBe('Instructor');
      expect(formatRole('mentor')).toBe('Mentor');
      expect(formatRole('admin')).toBe('Admin');
    });

    it('should handle uppercase input', () => {
      expect(formatRole('STUDENT')).toBe('Student');
      expect(formatRole('Admin')).toBe('Admin');
    });
  });
});

describe('Competency Utils', () => {
  const COMPETENCY_DIMS = [
    'promptEngineering',
    'modelEvaluation',
    'dataEthics',
    'automation',
    'criticalThinking',
    'collaboration',
    'communication',
    'toolFluency',
    'debugging',
    'domainApplication',
    'continuousLearning',
    'teachingOthers',
  ] as const;

  const calculateCompetencyAverage = (competencies: Record<string, number>): number => {
    const values = Object.values(competencies);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const getTopCompetencies = (competencies: Record<string, number>, limit: number = 3): string[] => {
    return Object.entries(competencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key);
  };

  describe('calculateCompetencyAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculateCompetencyAverage({ a: 80, b: 90, c: 100 })).toBe(90);
      expect(calculateCompetencyAverage({ x: 50, y: 50 })).toBe(50);
    });

    it('should return 0 for empty object', () => {
      expect(calculateCompetencyAverage({})).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateCompetencyAverage({ only: 75 })).toBe(75);
    });
  });

  describe('getTopCompetencies', () => {
    it('should return top N competencies', () => {
      const comps = { math: 90, science: 70, english: 85 };
      expect(getTopCompetencies(comps, 2)).toEqual(['math', 'english']);
    });

    it('should return all if less than limit', () => {
      const comps = { a: 10, b: 20 };
      expect(getTopCompetencies(comps, 5)).toEqual(['b', 'a']);
    });
  });

  it('should have all 12 competency dimensions', () => {
    expect(COMPETENCY_DIMS.length).toBe(12);
    expect(COMPETENCY_DIMS).toContain('promptEngineering');
    expect(COMPETENCY_DIMS).toContain('dataEthics');
    expect(COMPETENCY_DIMS).toContain('criticalThinking');
  });
});

describe('Validation Utils', () => {
  const validateSubmission = (content: string): { valid: boolean; error?: string } => {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: 'Content is required' };
    }
    if (content.length < 100) {
      return { valid: false, error: 'Content must be at least 100 characters' };
    }
    if (content.length > 10000) {
      return { valid: false, error: 'Content must be under 10000 characters' };
    }
    return { valid: true };
  };

  describe('validateSubmission', () => {
    it('should accept valid submission', () => {
      const longContent = 'a'.repeat(200);
      expect(validateSubmission(longContent)).toEqual({ valid: true });
    });

    it('should reject empty submission', () => {
      expect(validateSubmission('')).toEqual({ valid: false, error: 'Content is required' });
      expect(validateSubmission('   ')).toEqual({ valid: false, error: 'Content is required' });
    });

    it('should reject short submission', () => {
      expect(validateSubmission('short')).toEqual({ valid: false, error: 'Content must be at least 100 characters' });
    });

    it('should reject long submission', () => {
      const longContent = 'a'.repeat(10001);
      expect(validateSubmission(longContent)).toEqual({ valid: false, error: 'Content must be under 10000 characters' });
    });
  });
});
