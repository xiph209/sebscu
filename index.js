const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://oportunitati-ue.gov.ro/apeluri/?_sf_s=cercetare', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const data = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('.sf-apel').forEach(apel => {
        const linkEl = apel.querySelector('.entry-title a');
        const link = linkEl?.href || '';
        const name = linkEl?.innerText?.trim() || '';
        const idMatch = name.match(/ID[^\d]*(\d+)/i);
        const id = idMatch ? idMatch[1] : '';
        const budget = apel.querySelector('.sf-budget')?.innerText?.trim() || 'N/A';
        const deadline = apel.querySelector('.sf-deadline')?.innerText?.trim() || 'N/A';
        results.push({ link, name, id, budget, deadline });
      });
      return results;
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error('⚠️ Scraper error:', error);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper running at http://localhost:${PORT}/scrape`);
});