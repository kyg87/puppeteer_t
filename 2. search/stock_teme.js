// naver 테마별 주식 수집

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

var list = [];
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

async function printConsole1(content, id) {
    const body = $.load(content);
    //console.log(body)
    const anchorsSelector = 'img.img-tag';
    var anchors = [];

    const anchorsSelector1 = '.view-wrap > h1';

    var pid;
    var title;
    var imgs = [];
    var regDate;

    title = body(anchorsSelector1).text().trim();
    console.log(body(anchorsSelector1).text().trim());

    body(anchorsSelector).each(function () {
        //console.log($(this))
        anchors.push($(this));
    });
    console.log('이미지갯수', anchors.length)
    if (anchors.length > 0) {
        var i = 0;

        for (const el of anchors) {
            console.log(i)
            //console.log(el.attr('src'));

            //imgs.push({'src': el.attr('src')});

            url = el.attr('src')
            console.log(i, url)

            download.download(url, 'public/' + url.split('/')[url.split('/').length - 1].split('.')[0], function (a) {
                imgs.push({ 'src': a });

            })

            await sleep(1000);

        }

        var item = { 'pid': id, 'title': title, 'imgs': imgs, 'regDate': moment().format('YYYY-MM-DD HH:mm:ss') }
        MongoClient.connect(mUrl, function (err, client) {

            const db = client.db(dbName);
            try {
                db.collection('bodygall').insertOne(item)
                client.close();
            } catch (e) {
                console.log(e);
            }

        })
        await sleep(500);

    }

}

async function printConsole(theme, content) {
    // console.log(content)


    const body = $.load(content);

    const anchorsSelector = '#contentarea > div:nth-child(5) > table > tbody > tr';
    var anchors = [];

    
    body(anchorsSelector).each(function () {
        //console.log($(this))
        anchors.push($(this));
    });
    if (anchors.length > 0) {
        var i = 0;

        for (const el of anchors) {

            var data = {
                code: '',
                cname: '',
                type: '',
                theme: '',
                info: ''
            }
            if(el.find('td.name > div > a').text().trim() == '') break;
            
            
            console.log('종목명: ' + el.find('td.name > div > a').text());
            data.cname = el.find('td.name > div > a').text();
            var code = el.find('td.name > div > a').attr('href');

            if(el.find('td.name > div > span').text().trim() == ''){
                console.log('코스피')
                data.type = '코스피';
            }else{
                console.log('코스닥')
                data.type = '코스닥';
            }

            console.log('종목코드: ' + code.split('=')[1]);

            data.code = code.split('=')[1];
            console.log('편입사유: ' + el.find('td:nth-child(2) > div > div > p').text().trim())
            data.theme = theme;
            data.info = el.find('td:nth-child(2) > div > div > p').text().trim();


            list.push(data);
        }


    }


}

function ready() {

    
    MongoClient.connect(mUrl, function (err, client) {

        const db = client.db(dbName);

        db.collection("theme").find({}).toArray(function (err, result) {
            if (err) throw err;
            //console.log(result);

            start(result)

            client.close();
        });

    })
}

async function start(themeList) {

    for (const li of themeList) {
        console.log(li)

        
        await test(li.themeName, li.href)

        
        
        await sleep(10000);
        
    }

    console.log('DATA SAVE')

    MongoClient.connect(mUrl, function (err, client) {

        

        const db = client.db(dbName);

            //console.log(list)
            try {
                db.collection('stock').insertMany(list)
                client.close();
            } catch (e) {
                console.log(e);
            }

    })
}

async function test(name , a) {

    
    (async () => {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();

        //console.log("https://finance.naver.com" + a)
        await page.goto("https://finance.naver.com" + a, { waitUntil: "networkidle2" });
        const content = await page.content();
        
        await printConsole(name, content)


        await browser.close();

        
    })();
}
ready();
