import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const siteRoot = fileURLToPath(new URL('../../website/', import.meta.url)).replace(/\/$/, '');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

test('public site labels follow reviewed evidence, use-case routes work, and all views fit mobile', async () => {
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const path = resolve(siteRoot, `.${decodeURIComponent(pathname === '/' ? '/index.html' : pathname)}`);
      if (!path.startsWith(siteRoot + sep)) throw new Error('Outside site');
      const body = await readFile(path);
      response.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.SITE_TEST_BROWSER_PATH || (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const fixture = JSON.parse(await readFile(resolve(siteRoot, 'review.json'), 'utf8'));
    const passedTasks = {
      'ChatGPT Dots': ['purchase-research', 'checkout-handoff', 'reminder-delivery', 'reminder-change-cancel', 'expense-summary', 'browser-form'],
      GrokBot: ['purchase-research', 'reminder-change-cancel', 'expense-summary', 'browser-form'],
      Instinct: ['reminder-delivery', 'reminder-change-cancel', 'expense-summary', 'browser-form'],
      Muse: ['reminder-delivery', 'reminder-change-cancel', 'expense-summary', 'browser-form', 'memory-followup']
    };
    for (const task of fixture.tasks) {
      for (const name of fixture.agents) {
        const passed = passedTasks[name].includes(task.task_id);
        task.results[name].status = passed ? 'passed' : 'not_run';
        task.results[name].review_status = passed ? 'reviewed' : 'unreviewed';
      }
    }
    fixture.tasks.find(task => task.task_id === 'reminder-delivery').results.GrokBot.status = 'failed';
    fixture.tasks.find(task => task.task_id === 'reminder-delivery').results.GrokBot.review_status = 'reviewed';
    let dataset = fixture;
    await page.route('**/review.json', route => route.fulfill({ json: dataset }));
    const row = name => page.locator('.agent-row').filter({ has: page.getByRole('link', { name: `Review ${name}:`, exact: false }) });
    const labels = name => row(name).locator('.use-case-label');
    const fits = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

    await page.goto(url);
    await page.locator('.agent-row').first().waitFor();
    assert.equal(await page.title(), 'Best AI Agent for [ ] — reviewed results');
    assert.deepEqual(await labels('ChatGPT Dots').allTextContents(), ['Purchase research', 'Checkout handoff', 'Reminders', 'Expense cleanup', 'Browser forms']);
    assert.deepEqual(await labels('GrokBot').allTextContents(), ['Purchase research', 'Expense cleanup', 'Browser forms']);
    assert.deepEqual(await labels('Instinct').allTextContents(), ['Reminders', 'Expense cleanup', 'Browser forms']);
    assert.deepEqual(await labels('Muse').allTextContents(), ['Reminders', 'Expense cleanup', 'Browser forms', 'Memory recall']);
    assert.equal(await page.getByRole('link', { name: 'Video & transcripts', exact: true }).count(), 0);

    // Clicking a label compares the same two reminder tests for every assistant.
    await labels('Instinct').getByText('Reminders', { exact: true }).click();
    await page.waitForURL('**/#for/reminders');
    await page.getByRole('heading', { name: 'Best AI Agent for [ reminders ]', exact: true }).waitFor();
    assert.equal(await row('Instinct').locator('.task-dash').count(), 2);
    assert.equal(await row('GrokBot').locator('.task-dash.failed').count(), 1);
    assert.equal(await row('GrokBot').locator('.score-number').innerText(), '1/2');
    await page.reload();
    await page.getByRole('button', { name: 'Reminders', exact: false }).waitFor();
    assert.equal(await page.locator('[data-filter="Reminders"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.title(), 'Best AI Agent for reminders — reviewed results');

    await page.getByRole('button', { name: 'Grid view', exact: true }).click();
    await page.locator('.agent-list.grid').waitFor();
    assert.equal(await labels('GrokBot').getByText('Reminders', { exact: true }).count(), 0);
    await page.goto(url + '/#assistant/muse');
    await page.getByRole('heading', { name: 'Muse', exact: true }).waitFor();
    assert.equal(await page.locator('.profile-heading').getByRole('link', { name: 'Memory recall', exact: true }).count(), 1);
    assert.equal(await page.title(), 'Muse — Best AI Agent for [ ]');
    await page.goto(url + '/#compare');
    await page.locator('.comparison').waitFor();
    assert.equal(await page.locator('.comparison thead').getByRole('link', { name: 'Checkout handoff', exact: true }).count(), 1);

    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['#assistants', '#for/video', '#assistant/dots', '#compare', '#methodology']) {
        await page.goto(url + '/' + route);
        await page.waitForFunction(() => document.querySelector('.intro, .profile-hero'));
        await fits();
      }
    }

    // A correct status without completed review cannot create a capability claim.
    const unreviewed = structuredClone(fixture);
    const delivery = unreviewed.tasks.find(task => task.task_id === 'reminder-delivery');
    delivery.results['ChatGPT Dots'].review_status = 'unreviewed';
    delivery.results.GrokBot.status = 'passed';
    delivery.results.GrokBot.review_status = 'unreviewed';
    dataset = unreviewed;
    await page.goto(url);
    await page.locator('.agent-row').first().waitFor();
    assert.equal(await labels('ChatGPT Dots').getByText('Reminders', { exact: true }).count(), 0);
    assert.equal(await labels('GrokBot').getByText('Reminders', { exact: true }).count(), 0);
    assert.equal(await labels('Instinct').getByText('Reminders', { exact: true }).count(), 1);
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
