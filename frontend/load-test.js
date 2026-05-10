// VOKASI2 Load Test with k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be < 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
  },
};

const BASE_URL = 'http://localhost:1234';

export default function () {
  // Test 1: Homepage
  let res = http.get(BASE_URL);
  check(res, { 'homepage status 200': (r) => r.status === 200 });
  sleep(1);

  // Test 2: Login API
  const loginPayload = JSON.stringify({
    email: 'student@vokasi.id',
    password: 'Demo1234!',
  });
  
  res = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const success = check(res, {
    'login status 200': (r) => r.status === 200,
    'login returns token': (r) => r.json('token') !== undefined,
  });

  if (success) {
    const token = res.json('token');
    
    // Test 3: Portfolio API with auth
    res = http.get(`${BASE_URL}/api/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    check(res, { 'portfolio status 200': (r) => r.status === 200 });
  }
  
  sleep(1);

  // Test 4: Static pages
  const pages = ['/student', '/instructor', '/mentor', '/admin'];
  for (const page of pages) {
    res = http.get(`${BASE_URL}${page}`);
    check(res, { [`${page} loads`]: (r) => r.status === 200 });
    sleep(0.5);
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-report.json': JSON.stringify(data),
  };
}
