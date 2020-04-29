const puppeteer = require('puppeteer');
const $ = require('cheerio');

const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');
// Connection URL
const mUrl = 'mongodb://dridy:fkawk1@ds121906.mlab.com:21906/danang';
//mongodb://dridy:fkawk1@ds121906.mlab.com:21906/danang
//mongodb://<dbuser>:<dbpassword>@ds219308.mlab.com:19308/stock

// Database Name
const dbName = 'danang';

const request = require('request');
var moment = require('moment');
const download = require('./download.js');

var _category = process.argv[2];

var list = []

//https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyByPiFzLn8FcE16Wh-BmZ1aSwmiJ8g7bbQ

function getYoutubuID(searchKey) {

    return new Promise(function (resolve, reject) {
        request('https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyAWSOT_GvJQXcY0fkXJ1ulaxWLCbjW19Gg&q=' + searchKey, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
    //https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyAWSOT_GvJQXcY0fkXJ1ulaxWLCbjW19Gg&q='+searchKey
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

async function printConsole(content) {
    const body = $.load(content);
    //console.log(body)
    const anchorsSelector = '#grid1_body_tbody > tr:not([style*="display:none"]):not([style*="display: none"])';
    var anchors = [];

    body(anchorsSelector).each(function () {
        //console.log($(this))
        anchors.push($(this));
    });

    if(anchors.length > 0){
        for (const el of anchors) {

            // console.log(el.find('td').length);
            var d_dt = el.find('td:nth-child(1)');
            // console.log('배당락:' + d_dt.text())
            var d_payout = el.find('td:nth-child(2)');
            // console.log('배당일:' + d_payout.text())
            var code = el.find('td:nth-child(4)');

            var cname = el.find('td:nth-child(5)');

            var dividend = el.find('td:nth-child(10)');
            console.log('배당락:' + d_dt.text() + ' / ' + '배당일:' + d_payout.text() + ' / ' + '코드:' + code.text() + ' / ' + '종목명:' + cname.text() + ' / ' + '배당금:' + dividend.text())
            
            var classify = {
                CODE : code.text(),
                CNAME : cname.text(),
                DIVIDEND_DT : d_dt.text(),
                DIVIDEND_PAYOUT : d_payout.text(),
                DIVIDEND : dividend.text()
            }

            list.push(classify)
           
        }

        MongoClient.connect(mUrl, function (err, client) {

            const db = client.db(dbName);
            try {
                db.collection('d_stock').insertMany(list)
                client.close();
            } catch (e) {
                console.log(e);
            }

        })
    }
    else{
        console.log('데이터가 없습니다.')
    }

    

}


(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    //console.log("https://finance.naver.com" + a)
    await page.goto("http://www.seibro.or.kr/websquare/control.jsp?w2xPath=/IPORTAL/user/company/BIP_CNTS01041V.xml&menuNo=285#", { waitUntil: "networkidle2" });
    // const content = await page.content();

    await page.waitForSelector('#inputCalendar1_input')
    // await page.click('#inputCalendar1_input')

    // await page.waitFor(1000);
    //시작 달력 날짜
    // await page.type('#inputCalendar1_input','');

    await page.focus('#inputCalendar1_input');
    const inputValue = await page.$eval('#inputCalendar1_input', el => el.value);
    for (let i = 0; i < inputValue.length; i++) {
      await page.keyboard.press('Backspace');
    }
    await page.focus('#inputCalendar2_input');
    const inputValue2 = await page.$eval('#inputCalendar2_input', el => el.value);
    for (let i = 0; i < inputValue2.length; i++) {
      await page.keyboard.press('Backspace');
    }

    await page.type("select#Com_ISIN_input_0", "종목")
    await page.type('#inputCalendar1_input', '20100101');
    //종료 달력 날짜
    await page.type('#inputCalendar2_input','20191231');

    await page.type('#INPUT_SN2',_category);


    await sleep(2000);
    await page.click('.btn_seach');

    await sleep(2000);
    const content = await page.content();
    // console.log(content);

    await printConsole(content)
    await browser.close();


})();
