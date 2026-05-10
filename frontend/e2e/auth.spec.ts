import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
  });

  test('should login as student and redirect to student dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'student@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/student');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should login as instructor and redirect to instructor dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'instructor@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/instructor');
  });

  test('should login as mentor and redirect to mentor dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'mentor@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/mentor');
  });

  test('should login as admin and redirect to admin dashboard', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'student@vokasi.id');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email atau password salah')).toBeVisible();
  });
});

test.describe('Student Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/student');
  });

  test('should navigate to Challenge Arena', async ({ page }) => {
    await page.click('text=Arena');
    await expect(page).toHaveURL('/student/arena');
    await expect(page.locator('text=Challenge Arena')).toBeVisible();
  });

  test('should navigate to Courses', async ({ page }) => {
    await page.click('text=Courses');
    await expect(page).toHaveURL('/student/enrollments');
  });

  test('should navigate to Portfolio', async ({ page }) => {
    await page.click('text=Portfolio');
    await expect(page).toHaveURL('/student/portfolio');
  });

  test('should navigate to Badges', async ({ page }) => {
    await page.click('text=Badges');
    await expect(page).toHaveURL('/student/badges');
  });

  test('should navigate to Leaderboard', async ({ page }) => {
    await page.click('text=Leaderboard');
    await expect(page).toHaveURL('/student/leaderboard');
  });

  test('should navigate to AI Tutor', async ({ page }) => {
    await page.click('text=AI Tutor');
    await expect(page).toHaveURL('/student/tutor');
  });
});

test.describe('Instructor Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'instructor@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/instructor');
  });

  test('should navigate to My Courses', async ({ page }) => {
    await page.click('text=My Courses');
    await expect(page).toHaveURL('/instructor/courses');
  });

  test('should navigate to Students', async ({ page }) => {
    await page.click('text=Students');
    await expect(page).toHaveURL('/instructor/students');
  });

  test('should navigate to Analytics', async ({ page }) => {
    await page.click('text=Analytics');
    await expect(page).toHaveURL('/instructor/analytics');
  });

  test('should navigate to Documents', async ({ page }) => {
    await page.click('text=Documents');
    await expect(page).toHaveURL('/instructor/documents');
  });
});

test.describe('Mentor Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mentor@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/mentor');
  });

  test('should navigate to Requests', async ({ page }) => {
    await page.click('text=Requests');
    await expect(page).toHaveURL('/mentor/requests');
  });

  test('should navigate to My Students', async ({ page }) => {
    await page.click('text=My Students');
    await expect(page).toHaveURL('/mentor/students');
  });

  test('should navigate to Sessions', async ({ page }) => {
    await page.click('text=Sessions');
    await expect(page).toHaveURL('/mentor/sessions');
  });
});

test.describe('Admin Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@vokasi.id');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('should navigate to Users', async ({ page }) => {
    await page.click('text=Users');
    await expect(page).toHaveURL('/admin/users');
  });

  test('should navigate to Courses', async ({ page }) => {
    await page.click('text=Courses');
    await expect(page).toHaveURL('/admin/courses');
  });

  test('should navigate to Institutions', async ({ page }) => {
    await page.click('text=Institutions');
    await expect(page).toHaveURL('/admin/institutions');
  });

  test('should navigate to Analytics', async ({ page }) => {
    await page.click('text=Analytics');
    await expect(page).toHaveURL('/admin/analytics');
  });

  test('should navigate to Settings', async ({ page }) => {
    await page.click('text=Settings');
    await expect(page).toHaveURL('/admin/settings');
  });
});
