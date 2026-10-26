const { chromium } = require('playwright')
const assert = require('node:assert/strict')

async function main() {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || undefined })
  try {
    const page = await browser.newPage()
    page.setDefaultTimeout(10000)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const base = 'http://localhost:3107'

    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(base)
      const terminal = page.getByRole('textbox', { name: 'Terminal command', exact: true })
      const run = async command => {
        await terminal.fill(command)
        await terminal.press('Enter')
      }
      await run('about')
      await run('clear')
      assert.equal(await page.locator('.whitespace-pre-wrap').count(), 0, 'clear must remove old output')
      for (const command of ['constructor', '__proto__', 'toString']) {
        await run(command)
        assert((await page.locator('.whitespace-pre-wrap').last().innerText()).includes('Command not found'))
      }
      await run('  cat\t  education.txt  ')
      assert((await page.locator('.whitespace-pre-wrap').last().innerText()).includes('Expected graduation 2030'))
      await run('  echo   spaced message')
      assert.equal(await page.locator('.whitespace-pre-wrap').last().innerText(), 'spaced message')

      // Reject both attempts in the browser: no email or server action is sent.
      const submissions = []
      await page.route(base + '/', async route => {
        if (route.request().method() !== 'POST') return route.continue()
        submissions.push(route.request().postData())
        await route.fulfill({ status: 500, contentType: 'text/plain', body: 'Simulated temporary failure' })
      })
      await page.getByRole('button', { name: 'Contact', exact: true }).click()
      const contact = page.getByRole('textbox', { name: 'Contact terminal input' })
      for (const value of ['contact', 'RetryRegressionName', 'retry@example.test', 'RetryRegressionMessage', 'yes']) {
        await contact.fill(value)
        await contact.press('Enter')
      }
      await page.getByText('Critical Error:', { exact: false }).waitFor()
      await contact.fill('restart')
      await contact.press('Enter')
      await page.waitForFunction(() => document.body.innerText.split('Critical Error:').length === 3)
      assert.equal(submissions.length, 2)
      for (const body of submissions) {
        for (const value of ['RetryRegressionName', 'retry@example.test', 'RetryRegressionMessage']) assert(body.includes(value), 'Retry lost ' + value)
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Contact terminal overflow')
      if (width === 390) await page.screenshot({ path: '/tmp/portfolio-contact-regression.png', fullPage: true })
      await page.unroute(base + '/')
      console.log(`PASS ${width}px: clear, unknown/prototype commands, whitespace parsing, contact retry preserves fields, no page overflow`)
    }

    await page.goto(base + '/blog')
    assert((await page.locator('body').innerText()).includes('April 21, 2025'))
    await page.goto(base + '/blog/first-post')
    assert((await page.locator('article').innerText()).includes('April 21, 2025'))
    const missing = await page.goto(base + '/blog/does-not-exist')
    assert.equal(missing.status(), 404)
    assert.deepEqual(errors, [])
    console.log('PASS: blog dates agree with source, missing post returns 404, no browser page errors')
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
