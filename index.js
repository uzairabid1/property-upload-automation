require("dotenv").config();

const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');


puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUAPlugin());


const infoData = getInfoData('13071607/info.txt');
console.log(infoData);

const AUTH_BUTTON_SELECTOR = 'button';
const EMAIL_SELECTOR = '#Email';
const PASSWORD_SELECTOR = '#Password';
const SUBMIT_SELECTOR = 'button';
const REAL_ESTATE_SELECTOR = `(//div[@class='luk-flex luk-w-full luk-flex-row luk-flex-wrap luk-gap-3'])[1]/div[${(parseInt(infoData.realEstateType)+1).toString()}]/label`;
const AGREEMENT_SELECTOR = `(//div[@class='luk-flex luk-w-full luk-flex-row luk-flex-wrap luk-gap-3'])[2]/div[${(parseInt(infoData.agreementType)+1).toString()}]/label`;
const CITY_SELECTOR = `//span[contains(.,'Choose city')]/following-sibling::input`;
const ADDRESS_SELECTOR = "//span[.='Enter street']/preceding-sibling::input";
const NAME_SELECTOR = "//span[.='Name']/parent::div/following-sibling::div[1]/div[1]/div[1]/label/input";
const PHONE_SELECTOR = "//span[.='Name']/parent::div/following-sibling::div[4]/div[1]/div[1]/label/input";
const ROOMS_SELECTOR = `//span[.='Rooms']/parent::div/following-sibling::div[1]/div/div/div[${infoData.rooms.toString()}]`
const BEDROOM_SELECTOR = `//span[.='Bedroom']/parent::div/following-sibling::div[1]/div/div/div[${infoData.bedrooms.toString()}]`;

async function delay(time){
    return new Promise(resolve => setTimeout(resolve, time));
}

function getInfoData(filePath){
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(data);
        return jsonObject;
    } catch (err) {
        console.error('Error:', err);
    }
}


async function visitWebsite(page, url){
    await page.goto(url,{'waitUntil':'load'});
}

async function clickButton(page, selectorType , selector){
    if(selectorType=='CSS'){
        await page.waitForSelector(selector);
        const button = await page.$(selector);
        await button.evaluate(button => button.click());
    }
    else{
        await page.waitForSelector('xpath/'+selector);
        const [button] = await page.$$('xpath/'+selector);
        await button.evaluate(button => button.click());
    }

}

async function typeText(page, selectorType, selector, text){
    if(selectorType == 'CSS'){
        await page.waitForSelector(selector);
        await page.type(selector, text, {delay: 50});
    }else{
        await page.waitForSelector('xpath/' + selector);
        await page.type('xpath/' + selector, text, {delay: 100});
    }
}

async function login(page){
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const phone = process.env.PHONE;

    // Click on the authentication button
    await clickButton(page, 'CSS', AUTH_BUTTON_SELECTOR);
    // Type in email and password
    await typeText(page,'CSS', EMAIL_SELECTOR, email);
    await typeText(page, 'CSS', PASSWORD_SELECTOR, password);
    // Click on the submit button
    await clickButton(page,'CSS', SUBMIT_SELECTOR);
    await delay(50000);
    // Click on the real estate button
    await clickButton(page,'XPATH', REAL_ESTATE_SELECTOR);
    // Click on the deal type button
    await clickButton(page, 'XPATH', AGREEMENT_SELECTOR);
    // Type in city
    await typeText(page, 'XPATH', CITY_SELECTOR, 'Tbilisi');
    // Select Tbilisi
    await clickButton(page, 'XPATH', CITY_SELECTOR);
    await clickButton(page, 'CSS', "ul.options-list>li:nth-child(1)");
    // Type in Address
    await typeText(page, 'XPATH', ADDRESS_SELECTOR, infoData.address);
    // Select Address
    await clickButton(page, 'XPATH', ADDRESS_SELECTOR);
    await clickButton(page, 'CSS', 'ul.list-none>li:nth-child(1)');
    // Type in Name
    await typeText(page, 'XPATH', NAME_SELECTOR, 'Jane Doe');
    // Type in Phone
    await typeText(page, 'XPATH', PHONE_SELECTOR, phone);
    // Click on the room button
    await clickButton(page, 'XPATH', ROOMS_SELECTOR);
    // Clcik on the bedroom button
    await clickButton(page, 'XPATH', BEDROOM_SELECTOR);
    await delay(1000);

}

async function main(){

    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-notifications',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--start-maximized'
        ]  
    });
    const url = 'https://statements.tnet.ge/en/statement/create?referrer=myhome';
    let page = await browser.newPage();
    await visitWebsite(page, url);
    await login(page);
    
}


main();