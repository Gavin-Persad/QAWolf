const { chromium } = require('playwright');
const randomUseragent = require('random-useragent');
const fs = require('fs');
const winston = require('winston');

// Configure logging
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level.toUpperCase()}]: ${message}`;
		})
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'scraper.log' }),
	],
});

async function sortHackerNewsArticles() {
	// Create Random Agent
	const randomAgent = randomUseragent.getRandom();

	// Launch browser
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext({ userAgent: randomAgent });
	const page = await context.newPage({ byPassCSP: true });

	try {
		logger.info('Starting Hacker News Scraper');
		await page.goto('https://news.ycombinator.com/newest');
		await page.setDefaultTimeout(10000);
		await page.setViewportSize({ width: 800, height: 600 });

		// Get 100 newest articles
		let articlesData = [];
		let pageNum = 1;

		while (articlesData.length < 100) {
			try {
				// Get data from the page
				const data = await page.$$eval('.titleline', (articles) => {
					return articles.map((article) => ({
						title: article.querySelector('.titleline a').innerText,
						url: article.querySelector('.titleline a').href,
					}));
				});

				// Add data to the array
				articlesData = articlesData.concat(data);

				// Go to next page
				const nextPage = await page.$('.morelink');
				if (nextPage) {
					await nextPage.click();
					await page.waitForTimeout(3000);
				} else {
					break;
				}
				pageNum++;
			} catch (error) {
				logger.error(`Error on page ${pageNum}: ${error.message}`);
			}
		}

		// Store the data in an array of objects
		fs.writeFileSync(
			'articles.json',
			JSON.stringify(articlesData.slice(0, 100), null, 2)
		);
		logger.info('Scraping completed successfully');
	} catch (error) {
		logger.error(`Failed to scrape Hacker News: ${error.message}`);
	} finally {
		// Close Browser
		await browser.close();
		logger.info('Browser closed');
	}
}

(async () => {
	await sortHackerNewsArticles();
})().catch((error) => {
	logger.error(`Unhandled error: ${error.message}`);
	process.exit(1);
});
