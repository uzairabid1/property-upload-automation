require("dotenv").config();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');


puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUAPlugin());


const AUTH_BUTTON_SELECTOR = 'button';
const EMAIL_SELECTOR = '#Email';
const PASSWORD_SELECTOR = '#Password';
const SUBMIT_SELECTOR = 'button';


async function delay(time){
    return new Promise(resolve => setTimeout(resolve, time));
}



async function visitWebsite(page, url){
    await page.goto(url,{'waitUntil':'load'});
}

async function clickButton(page, selector){
    await page.waitForSelector(selector);
    const button = await page.$(selector);
    await button.evaluate(button => button.click());
}

async function typeText(page, selector, text){
    await page.waitForSelector(selector);
    await page.type(selector, text, {delay: 50});
}

async function login(page){
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    // Click on the authentication button
    await clickButton(page, AUTH_BUTTON_SELECTOR);
    // Type in email and password
    await typeText(page, EMAIL_SELECTOR, email);
    await typeText(page, PASSWORD_SELECTOR, password);
    // Click on the submit button
    await clickButton(page, SUBMIT_SELECTOR);
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