/**
 * @name Github
 *
 * @desc Logs into Github. Provide your username and password as environment variables when running the script, i.e:
 * `GITHUB_USER=myuser GITHUB_PWD=mypassword node github.js`
 *
 */


const puppeteer = require('puppeteer');
const $ = require('cheerio');

const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');
// Connection URL
const mUrl = 'mongodb://dridy:fkawk1@ds121906.mlab.com:21906/danang';

// Database Name
const dbName = 'danang';

const request = require('request');
var moment = require('moment');

var flist = [];
(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto('https://accounts.kakao.com/login/kakaomap?continue=https%3A%2F%2Fmap.kakao.com')

  await page.type('#id_email_2', 'dridy@naver.com')
  await page.type('#id_password_3', '!Ebsi57203927')

  await page.click('.btn_confirm')
  await page.waitForNavigation()



  await page.goto('https://map.kakao.com/folder/list.json?sort=CREATE_AT&mapUserId=gvhvdq')
  await page.waitFor(1000);
  const content = await page.content();

  await printConsole(content)


  MongoClient.connect(mUrl, function (err, client) {



    const db = client.db(dbName);

    //console.log(list)
    try {
      db.collection('daum').insertMany(flist)
      client.close();
    } catch (e) {
      console.log(e);
    }

  })

  await browser.close();
  //console.log('See screenshot: ' + screenshot)
})()


async function printConsole(content) {

  const body = $.load(content);
  //console.log(body)
  const anchorsSelector = 'pre';
  var anchors = [];
  var flist = [];
  body(anchorsSelector).each(function () {
    //console.log($(this))
    anchors.push($(this));
  });
  if (anchors.length > 0) {
    var i = 0;

    // console.log(anchors)

    //console.log(anchors)

    // console.log(result)

    for (const el of anchors) {
      //console.log(JSON.parse(el.text()));
      var r = JSON.parse(el.text());

      for (const f of r.result) {
        //flist.push(f.folderId)
        await test(f.folderId)

        await sleep(1000)
      }
      //console.log(flist);
    }


  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  });
}

async function test(a) {
  (async () => {
    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();

    await page.goto("https://map.kakao.com/favorite/list.json?folderIds%5B%5D=" + a + "&type=S", { waitUntil: "networkidle2" });
    const content = await page.content();
    //console.log(content);
    await printConsole1(content)
    await browser.close();
  })();
}

async function printConsole1(content) {

  const body = $.load(content);
  //console.log(body)
  const anchorsSelector = 'pre';
  var anchors = [];

  body(anchorsSelector).each(function () {
    //console.log($(this))
    anchors.push($(this));
  });
  if (anchors.length > 0) {
    var i = 0;

    // console.log(anchors)

    //console.log(anchors)

    // console.log(result)

    for (const el of anchors) {
      //console.log(JSON.parse(el.text()));
      var r = JSON.parse(el.text());

      for (const f of r.result) {

        flist.push(f)

        console.log(f);
      }
    


    }


  }
}