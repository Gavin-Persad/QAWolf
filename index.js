// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require('playwright');
const randomUseragent = require('random-useragent');
const fs = require('fs');

async function sortHackerNewsArticles() {
	// Create Random Agent
	const randomAgent = randomUseragent.getRandom();

	// launch browser
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext({ userAgent: randomAgent });
	const page = await context.newPage({ byPassCSP: true });
	await page.screenshot({ path: 'screenshot.png' });

	// go to Hacker News
	await page.goto('https://news.ycombinator.com/newest');
	await page.setDefaultTimeout(10000);
	await page.setViewportSize({ width: 800, height: 600 });

	// get 100 newest articles
	let articlesData = [];
	let pageNum = 1;

	//get data from the page
	while (articlesData.length < 100) {
		// get data from the page
		const data = await page.$$eval('.titleline', (articles) => {
			return articles.map((article) => ({
				title: article.querySelector('.titleline a').innerText,
				url: article.querySelector('.titleline a').href,
			}));
		});

		// add data to the array
		articlesData = articlesData.concat(data);

		//go to next page
		const nextPage = await page.$('.morelink');
		if (nextPage) {
			await nextPage.click();
			await page.waitForTimeout(3000);
		} else {
			break;
		}
		pageNum++;
	}

	// store the data in an array of objects
	const log = fs.createWriteStream('log.txt', { flags: 'w' });
	log.write(JSON.stringify(articlesData.slice(0, 100), null, ' '));

	//Close Browser
	await browser.close();
}

console.log('Starting Hacker News Scraper');

(async () => {
	await sortHackerNewsArticles();
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
