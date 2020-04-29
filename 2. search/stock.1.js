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

var _code = process.argv[2];
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

async function printConsole(content) {
    //console.log(content)


    const body = $.load(content);

    const anchorsSelector = '.html-attribute';
    var anchors = [];

    var classify = {
        code :'',
        cname:'',
        data:[],
        dt:''
    }
    body(anchorsSelector).each(function () {
        //console.log($(this))
        anchors.push($(this));
    });
    if (anchors.length > 0) {
        var i = 0;

        for (const el of anchors) {

            console.log(el.text())

            var _el = el.text().split('=');
            // console.log(_el[0])
            // console.log(_el[1])
            if (_el[0].trim() == 'symbol') {

                console.log('종목코드: ' + _el[1].replace(/\"/gi, "").trim());
                classify.code = _el[1].replace(/\"/gi, "").trim();
            } else if (_el[0].trim() == 'name') {
                console.log('종목이름: ' + _el[1].replace(/\"/gi, "").trim());
                classify.cname = _el[1].replace(/\"/gi, "").trim();
            } else if (_el[0].trim() == 'data') {
                console.log('data: ' + _el[1].replace(/\"/gi, "").trim());
                var _data = _el[1].replace(/\"/gi, "").trim().split('|');
                
                var stockData = {
                    dt:'',
                    open:'',
                    high:'',
                    low:'',
                    close:'',
                    volume:''

                }
                for (var i = 0; i < _data.length; i++) {
                    
                    
                    switch (i) {
                        case 0:
                            console.log('dt: ' + _data[i]);
                            stockData.dt = _data[i];
                            break;
                        case 1:
                            console.log('시가: ' + _data[i]);
                            stockData.open = _data[i];
                            break;
                        case 2:
                            console.log('고가: ' + _data[i]);
                            stockData.high = _data[i];
                            break;
                        case 3:
                            console.log('저가: ' + _data[i]);
                            stockData.low = _data[i];
                            break;
                        case 4:
                            console.log('종가: ' + _data[i]);
                            stockData.close = _data[i];
                            break;
                        case 5:
                            console.log('거래량: ' + _data[i]);
                            stockData.volume = _data[i];
                            break;
                        default:
                            break;
                    }
                }

                classify.data.push(stockData);
            }


        }

        console.log(classify)

        console.log(mUrl, dbName)
        // MongoClient.connect(mUrl, function (err, client) {
        //     console.log(client)
        //     const db = client.db(dbName);
        //     console.log(db)
        //     try {
        //         db.collection('stock_data').insertOne(classify)
        //         client.close();
        //     } catch (e) {
        //         console.log(e);
        //     }

        // })
    }
}

async function start(list) {

    console.log(list.length)
    for (const li of list) {
        console.log(li)

        
        await test(li)

        
        // await sleep(10000);
        break
    }

   
}

function ready() {

    
    MongoClient.connect(mUrl, function (err, client) {

        const db = client.db(dbName);

        db.collection("stock").find({}).toArray(function (err, result) {
            if (err) throw err;
            //console.log(result);

            start(result)

            client.close();
        });

    })
}
(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    //console.log("https://finance.naver.com" + a)
    await page.goto("https://fchart.stock.naver.com/sise.nhn?symbol="+_code+"&timeframe=day&count=100&requestType=0", { waitUntil: "networkidle2" });
    const content = await page.content();
    
    await printConsole(content)


    await browser.close();

    
})();
