const puppeteer = require('puppeteer');
const $ = require('cheerio');
var moment = require('moment');
const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');
// Connection URL
const mUrl = 'mongodb://dridy:fkawk1@ds121906.mlab.com:21906/danang';

// Database Name
const dbName = 'danang';

const request = require('request');


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
    const anchorsSelector = '#charts > div > div.chart-list.container > ol > li';
    var anchors = [];
    var title, price, url, elA;

    var list = [];

    var rank, title, artist, videoId, image, update_dt;
    body(anchorsSelector).each(function () {
        anchors.push($(this));
    });
    if (anchors.length > 0) {

        var i = 0;

        for (const el of anchors) {
            //console.log(el.text())
            rank = el.find('.chart-element__rank__number').text().trim();

            if (rank == '') continue;
            console.log(el.find('.chart-element__rank__number').text())
            title = el.find('button > span:nth-child(2) > span:nth-child(1)').text().trim();
            console.log(el.find('button > span:nth-child(2) > span:nth-child(1)').text().trim())
            artist = el.find('button > span:nth-child(2) > span:nth-child(2)').text().trim();
            console.log(el.find('button > span:nth-child(2) > span:nth-child(2)').text().trim())
            //console.log(el.find('.chart-element__information__artist text--truncate color--secondary').text())
            //var t = getYoutubuID(el.find('button > span:nth-child(2) > span:nth-child(1)').text().trim() + '-' + el.find('button > span:nth-child(2) > span:nth-child(2)').text().trim())

            getYoutubuID(el.find('button > span:nth-child(2) > span:nth-child(1)').text().trim() + '-' + el.find('button > span:nth-child(2) > span:nth-child(2)').text().trim()).then(function (val) {
                videoId = val.items[0].id.videoId;
                image = val.items[0].snippet.thumbnails.high.url;

                console.log(val.items[0].id.videoId);
                console.log(val.items[0].snippet.thumbnails.high.url);


                list.push({ 'rank': rank, 'title': title, 'artist': artist, 'image': image, 'videoId': videoId, 'update_dt': moment().format('YYYY-MM-DD HH:mm:ss') })

            }).catch(function (err) {
                console.log(err);
            });

            await sleep(1000)

        }


        MongoClient.connect(mUrl, function (err, client) {

            const db = client.db(dbName);

            db.collection('billboard').remove({}, function (err1, result) {

                console.log(result);

                try {
                    db.collection('billboard').insertMany(list)
                    client.close();
                } catch (e) {
                    console.log(e);
                }
            });


        })
        // MongoClient.connect(mUrl, function (err, client) {

        //     const db = client.db(dbName);


        //     try {
        //         db.collection('billboard').insertMany(list)
        //         client.close();
        //     } catch (e) {
        //         console.log(e);
        //     }

        // })


    }
}



(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto("https://www.billboard.com/charts/hot-100", { waitUntil: "networkidle2" });
    const content = await page.content();

    await printConsole(content);
    await browser.close();
})();

