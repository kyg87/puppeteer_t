const puppeteer = require('puppeteer'); 

async function run() {

    const browser = await puppeteer.launch( {
        headless: false  //change to true in prod!
    }); 

    const page = await browser.newPage(); 

    await page.goto('http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst?serviceKey=dCW3adZ68Sxo4ONV55uHMu%2Fxruk2RJ6mho7AP5CK36VDtoym95Fx55orw5lquQKIvO9qJXpyEyHNFeZ9fSJdRg%3D%3D&numOfRows=20&pageNo=1&sidoName=%EC%84%9C%EC%9A%B8&searchCondition=DAILY&&_returnType=json');

    var content = await page.content(); 

    innerText = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    }); 

    console.log("innerText now contains the JSON");
    console.log(innerText);

    //I will leave this as an excercise for you to
    //  write out to FS...

    //await browser.close(); 

};

run();