const puppeteer = require('puppeteer');

// (async () => {
// 	const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
// 	const page = await browser.newPage();

// 	await page.goto('https://camelcamelcamel.com/popular');

// 	console.log(title);
// 	await browser.close();
// })();

//await page.click('#Login_Button');

//const puppeteer = require('puppeteer');

let scrape = async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.setViewport({
		width: 1280,
		height: 1080,
	});
	
	let level = 0
	await page.goto('https://camelcamelcamel.com/popular', {waitUntil: 'load', timeout: 0});
	
	// await page.waitForNavigation({
	// 	waitUntil: 'networkidle0',
	// });	

	await page.screenshot({ path: `screenshot - ${level++}.png`, fullPage: true });
	var results = []; // variable to hold collection of all book titles and prices
	//var lastPageNumber this is hardcoded last catalogue page, you can set it dunamically if you wish
	await page.addScriptTag({ path: 'jquery.js' });
	var lastPageNumber = await page.evaluate(() => {
		const $ = window.$; //otherwise the transpiler will rename it and won't work
		return  Number($('ul.pagination li:nth-last-child(2) > a').html());
	});
	await page.screenshot({ path: `screenshot - ${level++}.png`, fullPage: true });
	console.log(lastPageNumber)
	// defined simple loop to iterate over number of catalogue pages
	for (let index = 0; index < lastPageNumber; index++) {
		// wait 1 sec for page load
		//await page.waitFor(1000);
		// call and wait extractedEvaluateCall and concatenate results every iteration.
		// You can use results.push, but will get collection of collections at the end of iteration
		results = results.concat(await extractedEvaluateCall(page));
		// this is where next button on page clicked to jump to another page
		if (index != lastPageNumber - 1) {
			// no next button on last page
			const [response] = await Promise.all([
				page.click('#content > div:nth-child(8) > div > nav > ul > li.pagination-next > a', ),
				page.waitForNavigation({
					waitUntil: 'domcontentloaded',
				}),
				page.waitForSelector('div.carousel_parent')
			]);

			


			await page.screenshot({ path: `screenshot - ${level++}.png`, fullPage: true });

		}
	}

	browser.close();
	return results;
};

async function extractedEvaluateCall(page) {
	// just extracted same exact logic in separate function
	// this function should use async keyword in order to work and take page as argument
	await page.addScriptTag({ path: 'jquery.js' });	
	return page.evaluate(() => {
		let data = [];

		$('div.card').map(function(i){

			$('div.card').map(function(i){
				data.push( {
					title: $(this).find('h6.popular_ptitle').text().replace('\n', ''),
					price: $(this).find('div.current_price').text(), 
					list: $(this).find('div.current_price').parent().children().eq(1).text().replace('\n', '').split(':')[1].replace('\n', ''),
					average: $(this).find('div.current_price').parent().children().eq(2).text().replace('\n', '').split(':')[1].replace('\n', ''), 
					image: $(this).find('div.thumbph > img').attr('src')
				})
			})			
		})		


		return data;
	});
}

scrape().then((value) => {
	console.log(JSON.stringify(value, null, '\t'));
	// console.log('Collection length: ' + value.length);
	// console.log(value[0]);
	// console.log(value[value.length - 1]);
});
