/**
 * @name Instagram
 *
 * @desc Logs into Instagram with credentials. Provide your username and password as environment variables when running the script, i.e:
 * `INSTAGRAM_USER=myuser INSTAGRAM_PWD=mypassword node instagram.js`
 *
 */
const puppeteer = require('puppeteer')
const screenshot = 'instagram.png';
(async () => {
	const browser = await puppeteer.launch({
		headless: false
	})
	const page = await browser.newPage()
	await page.goto("https://www.instagram.com/accounts/login/?source=auth_switcher", {
		waitUntil: 'networkidle2'
	});

	await page.on('dialog', async dialog => {

		console.log('에러창');
		await dialog.dismiss();
	});

	//email
	await page.waitForSelector("[name='username']");
	// await page.click("[name='username']");
	await page.type("[name='username']", 'gimyeonggyun524');

	//password
	await page.keyboard.down("Tab");
	//uncomment the following if you want the passwor dto be visible
	// page.$eval("._2hvTZ.pexuQ.zyHYP[type='password']", (el) => el.setAttribute("type", "text"));
	await page.keyboard.type('!@#$ebsi57203927');

	//#react-root > section > nav > div._8MQSO.Cx7Bp > div > div > div.LWmhU._0aCwM > input
	await page.click("[type='submit']");

	await page.waitFor(3000);
	await page.click('.aOOlW');
	await page.waitFor(2000);
	await page.type('#react-root > section > nav > div > div > div > div > input', 'carolinetrentini'); //번검색 팝업에 검색조건
	await page.waitFor(200);
	
	await page.goto('https://www.instagram.com/carolinetrentini/');


	await page.screenshot({ path: 'instagram.png' })
	//the selector of the "Login" button
	//await page.click("._0mzm-.sqdOP.L3NKy>.Igw0E.IwRSH.eGOV_._4EzTm");

	//we find the Login btn using the innerText comparison because the selector used for the btn might be unstable
	// await page.evaluate(() => {
	// 	let btns = [...document.querySelector(".HmktE").querySelectorAll("button")];
	// 	btns.forEach(function (btn) {
	// 		if (btn.innerText == "Log In")
	// 			btn.click();
	// 	});
	// });

	//Optional
	//check if the element asking to download the app arises
	// try {
	// 	await loginPage.waitForSelector("._3m3RQ._7XMpj",{
	// 		timeout:3000
	// 	});
	// 	await loginPage.click("._3m3RQ._7XMpj");
	// } catch (err) {

	// }

	//Optional
	//check if the app asks for notifications
	// try {
	// 	await loginPage.waitForSelector(".aOOlW.HoLwm",{
	// 		timeout:5000
	// 	});
	// 	await loginPage.click(".aOOlW.HoLwm");
	// } catch (err) {

	// }

	await page.waitForSelector(".glyphsSpriteMobile_nav_type_logo");

	await page.screenshot({ path: screenshot });

	browser.close()
	console.log('See screenshot: ' + screenshot)
})()
