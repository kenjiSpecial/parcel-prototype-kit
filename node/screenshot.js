/**
 * screenshot page with puppeteer
 */

const argv = require('minimist')(process.argv.slice(2));
const dir = argv.dir;
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({ width: 640, height: 360 });
	await page.goto(`http://localhost:8200/docs/${dir}/index.html?NoDebug/`);
	// await delay(2000);
	await page.screenshot({ path: `docs/${dir}/thumbnail.png` });

	await browser.close();
})();

function delay(delay) {
	return new Promise(function(fulfill) {
		setTimeout(fulfill, delay);
	});
}
