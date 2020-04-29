/**
 * @name Github
 *
 * @desc Logs into Github. Provide your username and password as environment variables when running the script, i.e:
 * `GITHUB_USER=myuser GITHUB_PWD=mypassword node github.js`
 *
 */
const puppeteer = require('puppeteer')
const screenshot = 'github.png';
(async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.goto('https://map.kakao.com/?target=other&folderid=1873988')
  
  console.log(process.env.GITHUB_USER);
  console.log(process.env.GITHUB_PWD);
  await page.type('#login_field', 'dridy@naver.com')
  await page.type('#password', '!Ebsi57203927')

  await page.click('[name="commit"]')
  await page.waitForNavigation()
  await page.screenshot({ path: screenshot })
  browser.close()
  console.log('See screenshot: ' + screenshot)
})()
