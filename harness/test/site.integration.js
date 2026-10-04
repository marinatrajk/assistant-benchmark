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

test('search-intent categories show reviewed coverage, expose test packages, and fit mobile', async () => {
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
    fixture.tasks.find(task => task.task_id === 'browser-research').results.Instinct = { ...fixture.tasks.find(task => task.task_id === 'browser-research').results.Instinct, status: 'partial', review_status: 'reviewed' };
    let dataset = fixture;
    await page.route('**/review.json', route => route.fulfill({ json: dataset }));
    const row = name => page.locator('.agent-row').filter({ has: page.getByRole('link', { name: `Review ${name}:`, exact: false }) });
    const labels = name => row(name).locator('.use-case-label');
    const fits = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

    await page.goto(url);
    await page.locator('.agent-row').first().waitFor();
    assert.equal(await page.title(), 'Best AI Agent for [ ] — reviewed results');
    assert.deepEqual(await labels('ChatGPT Dots').allTextContents(), ['Research 1/4', 'Personal assistant 4/9', 'Small business 1/2']);
    assert.deepEqual(await labels('GrokBot').allTextContents(), ['Research 1/4', 'Personal assistant 2/9', 'Small business 1/2']);
    assert.deepEqual(await labels('Instinct').allTextContents(), ['Research 0/4', 'Personal assistant 3/9', 'Small business 1/2']);
    assert.deepEqual(await labels('Muse').allTextContents(), ['Personal assistant 4/9', 'Small business 1/2']);
    assert.equal(await page.locator('.filters .chip').count(), 16);
    assert.equal(await row('ChatGPT Dots').locator('.task-dash').count(), 27);
    assert.equal(await page.locator('.manual-note, .snapshot-note').count(), 0);
    assert.equal(await labels('Instinct').filter({ hasText: 'Research' }).evaluate(el => el.classList.contains('has-passes')), false);

    // Broad categories compare every mapped task, including the new unrun case.
    await labels('Instinct').filter({ hasText: 'Personal assistant' }).click();
    await page.waitForURL('**/#for/personal');
    await page.getByRole('heading', { name: 'Best AI Agent for [ personal use ]', exact: true }).waitFor();
    assert.equal(await row('Instinct').locator('.task-dash').count(), 9);
    assert.equal(await row('GrokBot').locator('.task-dash.failed').count(), 1);
    assert.equal(await row('GrokBot').locator('.score-number').innerText(), '2/9');
    await page.reload();
    await page.locator('[data-filter="Personal assistant"]').waitFor();
    assert.equal(await page.locator('[data-filter="Personal assistant"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.title(), 'Best AI Agent for personal use — reviewed results');
    await page.getByRole('button', { name: 'Grid view', exact: true }).click();
    await page.locator('.agent-list.grid').waitFor();
    assert.equal(await labels('GrokBot').filter({ hasText: 'Personal assistant 2/9' }).count(), 1);

    // New categories retain unrun results; instructions and ZIPs remain in profiles.
    await page.locator('[data-filter="Travel planning"]').click();
    await page.waitForURL('**/#for/travel');
    await page.locator('[data-filter="Travel planning"][aria-pressed="true"]').waitFor();
    assert.equal(await row('ChatGPT Dots').locator('.score-number').innerText(), '0/1');
    assert.equal(await row('ChatGPT Dots').locator('.metric-coverage').innerText(), '0 reviewed');
    assert.equal(await page.locator('.task-dash.not_run').count(), 4);
    assert.equal(await page.locator('.rank').first().innerText(), '—');
    assert.equal(await page.locator('.agent-labels a[href="#for/travel"]').count(), 0);
    await row('ChatGPT Dots').locator('.agent-profile-link').click();
    const travelTask = page.locator('.task-result').filter({ has: page.getByRole('heading', { name: 'Trip planning under a budget' }) });
    await travelTask.locator('.skill-protocol summary').click();
    const protocolHref = await travelTask.getByRole('link', { name: 'Instructions and checks' }).getAttribute('href');
    const protocol = await page.request.get(url + '/' + protocolHref);
    assert.equal(protocol.ok(), true);
    assert.match(await protocol.text(), /Separate operator change request/);
    const packageHref = await travelTask.getByRole('link', { name: 'Download skill ZIP' }).getAttribute('href');
    const download = await page.request.get(url + '/' + packageHref);
    assert.equal(download.ok(), true);
    assert.equal((await download.body()).subarray(0, 2).toString(), 'PK');

    await page.goto(url + '/#for/reminders');
    await page.waitForURL('**/#for/personal');
    await page.goto(url + '/#assistant/muse');
    await page.getByRole('heading', { name: 'Muse', exact: true }).waitFor();
    assert.equal(await page.locator('.profile-heading').getByRole('link', { name: 'Personal assistant 4/9', exact: true }).count(), 1);
    assert.equal(await page.locator('.task-result').count(), 27);
    assert.equal(await page.title(), 'Muse — Best AI Agent for [ ]');
    await page.goto(url + '/#compare');
    await page.locator('.comparison').waitFor();
    assert.equal(await page.locator('.comparison tbody tr').count(), 27);
    assert.equal(await page.locator('.comparison thead').getByRole('link', { name: 'Small business 1/2', exact: true }).count(), 4);

    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['#assistants', '#for/images', '#for/finance', '#for/travel', '#assistant/dots', '#compare', '#methodology']) {
        await page.goto(url + '/' + route);
        await page.waitForFunction(() => document.querySelector('.intro, .profile-hero'));
        await fits();
      }
    }

    // Self-reported passes never increase the count; no review means no category tag.
    const unreviewed = structuredClone(fixture);
    const delivery = unreviewed.tasks.find(task => task.task_id === 'reminder-delivery');
    delivery.results['ChatGPT Dots'].review_status = 'unreviewed';
    delivery.results.GrokBot.status = 'passed';
    delivery.results.GrokBot.review_status = 'unreviewed';
    unreviewed.tasks.find(task => task.task_id === 'expense-summary').results['ChatGPT Dots'].review_status = 'unreviewed';
    dataset = unreviewed;
    await page.goto(url);
    await page.locator('.agent-row').first().waitFor();
    assert.equal(await labels('ChatGPT Dots').filter({ hasText: 'Personal assistant 3/9' }).count(), 1);
    assert.equal(await labels('GrokBot').filter({ hasText: 'Personal assistant 2/9' }).count(), 1);
    assert.equal(await labels('ChatGPT Dots').filter({ hasText: 'Small business' }).count(), 0);
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
