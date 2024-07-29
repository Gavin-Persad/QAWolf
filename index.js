// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require('playwright');
const randomUseragent = require('random-useragent');

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
	//get data from the page
	const data = await page.$$eval('.titleline', (articles) => {
		const articlesData = [];
		articles.forEach((article) => {
			const title = article.querySelector('.titleline a').innerText;
			const url = article.querySelector('.titleline a').href;
			articlesData.push({
				title,
				url,
			});
		});
		console.log(articlesData);
		return articlesData;
	});

	// Log the data in the terminal
	console.log(data);

	// store the data in an array of objects

	//Close Browser
	await browser.close();
}

(async () => {
	await sortHackerNewsArticles();
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
