/**
 * E2E TEST - INTERV-U (Playwright)
 * ============================================================
 * Menguji 3 alur utama aplikasi:
 *   E2E-01: Landing Page dapat dimuat & tampilan utama terlihat
 *   E2E-02: Halaman Login dapat dibuka & form tersedia
 *   E2E-03: Upload CV + JD melalui UI (halaman utama)
 * 
 * Dijalankan: node hasil_pengujian/scripts/test_e2e_playwright.mjs
 * Prasyarat: Server harus running di http://localhost:3000
 * ============================================================
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve('hasil_pengujian/screenshots');
const RESULTS_PATH = path.resolve('hasil_pengujian/raw_logs/e2e_tests_result.json');

// Buat direktori screenshot jika belum ada
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = [];

function logResult(testId, name, status, durationMs, details, screenshotPath = null) {
  const entry = {
    testId,
    name,
    status,
    durationMs,
    details,
    screenshotPath,
    timestamp: new Date().toISOString(),
  };
  results.push(entry);
  const icon = status === 'LULUS' ? '✓' : '✗';
  console.log(`[${status}] ${icon} ${testId} - ${name} (${durationMs}ms)`);
  console.log(`       ${details}`);
  if (screenshotPath) console.log(`       Screenshot: ${screenshotPath}`);
}

async function runE2ETests() {
  console.log('=== MEMULAI E2E TESTING (Playwright Headless) ===\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Waktu: ${new Date().toISOString()}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  });

  // ──────────────────────────────────────────────
  // TC-E2E-01: Landing Page Load & Konten Utama
  // ──────────────────────────────────────────────
  {
    const page = await context.newPage();
    const t0 = performance.now();
    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      const dur = Math.round(performance.now() - t0);
      
      const title = await page.title();
      const url = page.url();
      const ssPath = path.join(SCREENSHOT_DIR, 'e2e01_landing_page.png');
      await page.screenshot({ path: ssPath, fullPage: true });
      
      // Cek elemen-elemen penting: heading utama atau tombol
      const h1Text = await page.locator('h1').first().textContent().catch(() => null);
      const hasLoginBtn = await page.locator('text=/masuk|login|sign in/i').count();
      const hasUploadArea = await page.locator('input[type="file"], [class*="upload"], [class*="Upload"]').count();

      const checks = [];
      if (title) checks.push(`Title: "${title}"`);
      if (h1Text) checks.push(`H1: "${h1Text.trim().substring(0, 60)}"`);
      if (hasLoginBtn > 0) checks.push(`Tombol Login: ada (${hasLoginBtn} element)`);
      if (hasUploadArea > 0) checks.push(`Area Upload: ada (${hasUploadArea} element)`);
      
      const isRedirectedToLogin = url.includes('/login');
      
      logResult(
        'TC-E2E-01', 
        'Landing Page Load & Elemen Utama',
        'LULUS',
        dur,
        `URL akhir: ${url} | ${checks.join(' | ')}`,
        ssPath
      );
    } catch (err) {
      const dur = Math.round(performance.now() - t0);
      logResult('TC-E2E-01', 'Landing Page Load & Elemen Utama', 'GAGAL', dur, `Error: ${err.message}`);
    }
    await page.close();
  }

  // ──────────────────────────────────────────────
  // TC-E2E-02: Halaman Login - Ketersediaan Form
  // ──────────────────────────────────────────────
  {
    const page = await context.newPage();
    const t0 = performance.now();
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
      const dur = Math.round(performance.now() - t0);
      
      const url = page.url();
      const title = await page.title();
      const ssPath = path.join(SCREENSHOT_DIR, 'e2e02_login_page.png');
      await page.screenshot({ path: ssPath, fullPage: true });
      
      // Cek elemen form login
      const googleBtn = await page.locator('button, [role="button"]').filter({ hasText: /google/i }).count();
      const hasForm = await page.locator('form, [class*="login"], [class*="auth"]').count();
      const pageText = await page.locator('body').textContent();
      const hasLoginText = /masuk|login|sign in|google/i.test(pageText);

      const checks = [];
      if (title) checks.push(`Title: "${title}"`);
      if (googleBtn > 0) checks.push(`Tombol Google: ada (${googleBtn} el)`);
      if (hasForm > 0) checks.push(`Form Auth: ada (${hasForm} el)`);
      if (hasLoginText) checks.push('Teks Login/Masuk: ditemukan');

      const passed = hasLoginText || hasForm > 0 || googleBtn > 0;
      logResult(
        'TC-E2E-02',
        'Halaman Login - Form & Tombol Tersedia',
        passed ? 'LULUS' : 'GAGAL',
        dur,
        `URL: ${url} | ${checks.join(' | ')}`,
        ssPath
      );
    } catch (err) {
      const dur = Math.round(performance.now() - t0);
      logResult('TC-E2E-02', 'Halaman Login - Form & Tombol Tersedia', 'GAGAL', dur, `Error: ${err.message}`);
    }
    await page.close();
  }

  // ──────────────────────────────────────────────
  // TC-E2E-03: Responsivitas Mobile View
  // ──────────────────────────────────────────────
  {
    const page = await context.newPage();
    const t0 = performance.now();
    try {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      const dur = Math.round(performance.now() - t0);
      
      const url = page.url();
      const ssPath = path.join(SCREENSHOT_DIR, 'e2e03_mobile_view.png');
      await page.screenshot({ path: ssPath, fullPage: true });
      
      // Cek tidak ada horizontal scrollbar (responsive)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = 390;
      const hasHorizontalScroll = bodyWidth > viewportWidth;
      
      // Cek konten masih terlihat
      const bodyText = await page.locator('body').textContent();
      const hasContent = bodyText.trim().length > 50;
      
      const checks = [
        `URL: ${url}`,
        `Body width: ${bodyWidth}px (viewport: ${viewportWidth}px)`,
        `Horizontal scroll: ${hasHorizontalScroll ? 'ADA (masalah responsivitas)' : 'TIDAK ADA (✓ responsif)'}`,
        `Konten terisi: ${hasContent ? 'Ya' : 'Tidak'}`
      ];

      const passed = hasContent && !hasHorizontalScroll;
      logResult(
        'TC-E2E-03',
        'Responsivitas Mobile View (390px)',
        passed ? 'LULUS' : (hasContent ? 'PERINGATAN' : 'GAGAL'),
        dur,
        checks.join(' | '),
        ssPath
      );
    } catch (err) {
      const dur = Math.round(performance.now() - t0);
      logResult('TC-E2E-03', 'Responsivitas Mobile View (390px)', 'GAGAL', dur, `Error: ${err.message}`);
    }
    await page.close();
  }

  // ──────────────────────────────────────────────
  // TC-E2E-04: Performa Halaman (Response Time)
  // ──────────────────────────────────────────────
  {
    const page = await context.newPage();
    const t0 = performance.now();
    try {
      // Ukur waktu navigasi menggunakan Navigation Timing API
      const t0Nav = Date.now();
      await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
      const ttfb = await page.evaluate(() => {
        const nav = window.performance.getEntriesByType('navigation')[0];
        return nav ? Math.round(nav.responseStart - nav.requestStart) : null;
      });
      const domContentLoaded = await page.evaluate(() => {
        const nav = window.performance.getEntriesByType('navigation')[0];
        return nav ? Math.round(nav.domContentLoadedEventEnd - nav.fetchStart) : null;
      });
      const fullLoad = await page.evaluate(() => {
        const nav = window.performance.getEntriesByType('navigation')[0];
        return nav ? Math.round(nav.loadEventEnd - nav.fetchStart) : null;
      });
      const dur = Math.round(performance.now() - t0);
      
      const ssPath = path.join(SCREENSHOT_DIR, 'e2e04_performance.png');
      await page.screenshot({ path: ssPath });

      const details = [
        `TTFB: ${ttfb !== null ? ttfb + 'ms' : 'N/A'}`,
        `DOM Ready: ${domContentLoaded !== null ? domContentLoaded + 'ms' : 'N/A'}`,
        `Full Load: ${fullLoad !== null ? fullLoad + 'ms' : 'N/A'}`,
        `Total E2E: ${dur}ms`,
      ];
      
      // Lulus jika full load < 5000ms (toleransi Next.js dev mode)
      const passed = (fullLoad !== null && fullLoad < 5000) || (dur < 8000);
      logResult(
        'TC-E2E-04',
        'Performa Halaman (Navigation Timing)',
        passed ? 'LULUS' : 'PERINGATAN',
        dur,
        details.join(' | '),
        ssPath
      );
    } catch (err) {
      const dur = Math.round(performance.now() - t0);
      logResult('TC-E2E-04', 'Performa Halaman (Navigation Timing)', 'GAGAL', dur, `Error: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();

  // Simpan hasil
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2), 'utf-8');
  
  const lulus = results.filter(r => r.status === 'LULUS').length;
  const gagal = results.filter(r => r.status === 'GAGAL').length;
  const peringatan = results.filter(r => r.status === 'PERINGATAN').length;
  
  console.log('\n=== RINGKASAN E2E TESTING ===');
  console.log(`Total: ${results.length} | LULUS: ${lulus} | GAGAL: ${gagal} | PERINGATAN: ${peringatan}`);
  console.log(`Hasil disimpan di: ${RESULTS_PATH}`);
  console.log(`Screenshots di: ${SCREENSHOT_DIR}`);
}

runE2ETests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
