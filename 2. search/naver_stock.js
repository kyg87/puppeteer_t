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

async function printConsole1(content) {
    const body = $.load(content);

    const anchorsSelector = '#contentarea_left > table.type_1.theme > tbody > tr > td > a';

    var anchors = [];

    

    body(anchorsSelector).each(function () {
        //console.log($(this))
        anchors.push($(this));
    });

    if (anchors.length > 0) {
        var i = 0;

        for (const el of anchors) {

            if (i % 3 == 0) {
                var classify = {
                    dt: '',
                    href: '',
                    themeName: '',
                }
                classify.themeName = el.text().trim();
                classify.href = el.attr('href');
                classify.dt = moment().format('YYYY-MM-DD HH:mm:ss');
                console.log(el.text().trim(), el.attr('href'))
                list.push(classify);
            }


            i++
        }

        
        console.log('page Down')
        
    }

}


async function printConsole(content) {
    //  console.log(content)


    const body = $.load(content);

    const navi = '#contentarea_left > table.Nnavi > tbody > tr > td > a';



    var anchors1 = [];


    body(navi).each(function () {
        //console.log($(this))
        anchors1.push($(this));
    });

    if (anchors1.length > 0) {

        console.log('갯수:' + anchors1.length)
        var count = anchors1.length;
        var i = 1;
        for (const el of anchors1) {
            if (i == count) continue;
            await test(i)

            i++;
        }




    }

}

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto("https://finance.naver.com/sise/theme.nhn", { waitUntil: "networkidle2" });
    const content = await page.content();
    await printConsole(content);


    await sleep(20000);
    MongoClient.connect(mUrl, function (err, client) {

        const db = client.db(dbName);

        console.log('최종',list)
        try {
            db.collection('theme').insertMany(list)
            client.close();
        } catch (e) {
            console.log(e);
        }

    })
    await browser.close();
})();


async function test(a) {
    (async () => {
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();

        await page.goto("https://finance.naver.com/sise/theme.nhn?&page=" + a, { waitUntil: "networkidle2" });
        const content = await page.content();
        console.log("https://finance.naver.com/sise/theme.nhn?&page=" + a);
        await printConsole1(content)

        
        await browser.close();
    })();
}