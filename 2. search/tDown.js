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
const download = require('./download.js');
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

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
  }

async function printConsole1(content) {
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
            
            download.download(url,'public/images/'+ url.split('/')[url.split('/').length-1].split('.')[0],function(a){
                console.log(title,replaceAll(a,'%',''))
                imgs.push({'src': replaceAll(a,'%','')});
            })
            
            await sleep(1000);
            
        }

    }

}

async function printConsole(content) {
    const body = $.load(content);
    //console.log(body)
    const anchorsSelector = '#fboardlist > div.table-responsive.list-pc > table > tbody > tr > td:nth-child(2) > a';
    var anchors = [];

    body(anchorsSelector).each(function () {
        //console.log($(this))
        anchors.push($(this));
    });
    if (anchors.length > 0) {
        var i = 0;
        
        for (const el of anchors) {
            var check = false;
            if (i == 0) {
                i++;
                continue;
            }
            console.log(el.attr('href'))

            var a = el.attr('href');

            var id = a.split('=')[2];
            console.log('id', id)

            MongoClient.connect(mUrl, function (err, client) {

                const db = client.db(dbName);

                db.collection("bodygall").findOne({ 'pid': id }, function (err, result) {
                    if (err) throw err;
                    console.log('result',result);
                    
                    if(result != null){
                        check = true;
                        client.close();
                    } 
                    client.close();
                });

            })
           

            
            await sleep(10000);
            console.log('check', check, id)
            if(check == false){
                await test(a, id);
            }
            else{
                break;
            }
            //await test(a, id);
            //break;
            //await sleep(10000);

        }

    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto("http://humorbook.co.kr/bbs/board.php?bo_table=star&wr_id=130198", { waitUntil: "networkidle2" });
    const content = await page.content();
    await printConsole1(content);
    await browser.close();
})();

async function test(a, id) {
    (async () => {
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();

        await page.goto("http://humorbook.co.kr/bbs/board.php?bo_table=bodygall&wr_id=" + a, { waitUntil: "networkidle2" });
        const content = await page.content();
        //console.log(content);
        await printConsole1(content)
        await browser.close();
    })();
}