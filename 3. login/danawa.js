/**
 * @name Google Social Login
 *
 * @desc Logs into Checkly using Google social Login. Provide your username and password as environment variables when running the script, i.e:
 * `GOOGLE_USER=myuser GOOGLE_PWD=mypassword node google_social.js`
 *
 */
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  const screenshot = 'danawa.png'
  try {
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto('http://event.danawa.com/hanmi_lotto_191227');

    const navigationPromise = page.waitForNavigation()

    await page.on('dialog', async dialog => {

      console.log('에러창');
      await dialog.dismiss();
    });

    //await page.waitForSelector('div > .social > .text-center > .login-google-button > span')
    await page.click('.my_page_service > a > .my_serv_tit')
    await page.screenshot({ path: screenshot })
    await navigationPromise
    await page.waitForSelector('#danawa-member-login-input-id')
    await page.type('#danawa-member-login-input-id', 'dridy') //다나와 id
    await page.type('#danawa-member-login-input-pwd', 'QXQkF8LKYuJwhd%') //다나와 pw

    await page.click('.btn_login')
    await page.waitFor(1000)
    await page.click('#btn-auto-lotto-number')
    await page.waitFor(1000)
    await page.click('#join-lotto-event')
    await page.waitFor(1000)
    //자동번호 이후 등록

    await page.type('#prasName', '김영균'); //당첨시 이름
    await page.type('#prasEmail', 'dridy@naver.com'); //당첨시 이메일
    await page.type('#prasPhoneNumber', '01023647839'); //당첨시 핸드폰
    await navigationPromise

    await page.click('.clr > button');




    const pages = await browser.pages();

    console.log(pages.length)

    await navigationPromise

    //await browser.close()

    console.log(pages[2].url())

    await page.waitFor(2000);
    await pages[2].type('#ipt_lb', '신당 133-24'); //번검색 팝업에 검색조건

    await pages[2].click('.ipt_inner > a');

    await pages[2].waitFor(2000)

    await pages[2].click('.zip_item > a > span > span')

    await page.waitFor(2000)
    await page.type('#addressDetail', '리버그린 501호'); //상세주소
    await page.click('#agree1');
    await page.click('#agree2');
    await page.waitFor(2000)
    await page.click('#btn-privacy-agree-confirm');


    await page.waitFor(2000)
    await page.screenshot({ path: screenshot })
  } catch (err) {
    console.error('catch~~~~~~~~~~~~~~~~]]]', err.message);
  }finally{
    await page.screenshot({ path: screenshot })
    await browser.close();
  }


})()


