const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://oportunitati-ue.gov.ro/apeluri/?_sf_s=cercetare', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    const data = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('.lista-apeluri > .item').forEach(apel => {
        const linkEl = apel.querySelector('.entry-title a');
        const link = linkEl?.href || '';
        const name = linkEl?.innerText?.trim() || '';

        const idMatch = name.match(/ID[^\d]*(\d+)/i);
        const id = idMatch ? idMatch[1] : '';

        const budgetEl = Array.from(apel.querySelectorAll('p')).find(p =>
          p.textContent.includes('EUR')
        );
        const budget = budgetEl?.innerText?.trim() || 'N/A';

        const deadlineEl = Array.from(apel.querySelectorAll('div.col-6')).find(div =>
          div.innerText.includes('Data deschiderii')
        );
        const deadline = deadlineEl?.innerText?.replace('Data deschiderii', '').trim() || 'N/A';

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
  console.log(`🚀 Playwright scraper running at http://localhost:${PORT}/scrape`);
});