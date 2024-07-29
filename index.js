// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require('playwright');

async function sortHackerNewsArticles() {
	// launch browser
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.screenshot({ path: 'screenshot.png' });
	// go to Hacker News
	await page.goto('https://news.ycombinator.com/newest');
	await page.setDefaultTimeout(10000);
	await page.setViewportSize({ width: 800, height: 600 });
	// get 100 newest articles

	//Close Browser
	await browser.close();
}

(async () => {
	await sortHackerNewsArticles();
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
