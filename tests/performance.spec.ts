import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __vitals: Record<string, number>;
  }
}

// Web Vitals 측정용 스크립트 (web-vitals 라이브러리 필요)
const webVitalsScript = `
  window.__vitals = {};
  (function() {
    function storeResult(name, value) {
      window.__vitals[name] = value;
    }
    function onPerfEntry(entry) {
      if (entry.name === 'first-contentful-paint') storeResult('FCP', entry.startTime);
      if (entry.name === 'largest-contentful-paint') storeResult('LCP', entry.startTime);
    }
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        onPerfEntry(entry);
      }
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') storeResult('LCP', entry.startTime);
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    // CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      storeResult('CLS', clsValue);
    }).observe({ type: 'layout-shift', buffered: true });
  })();
`;

test.describe('Web Vitals Performance', () => {
  test('LCP, FCP, CLS 측정', async ({ page }) => {
    await page.addInitScript(webVitalsScript);
    await page.goto('http://localhost:3000/', { waitUntil: 'load' });
    // 사용자 입력 시나리오 (FID/INP 측정용)
    await page.mouse.move(10, 10);
    await page.mouse.down();
    await page.mouse.up();
    // Web Vitals 값 추출
    const vitals = await page.evaluate(() => window.__vitals);
    console.log('Web Vitals:', vitals);
    // 완화된 성능 기준 (개발 환경용)
    expect(vitals.FCP).toBeLessThan(3000); // ms
    expect(vitals.LCP).toBeLessThan(3500); // ms
    expect(vitals.CLS).toBeLessThan(0.2);  // 무한 스크롤 등 예외 상황은 조정
  });
}); 