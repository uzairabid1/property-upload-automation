require('dotenv').config();

const fs = require('fs');
const asyncFs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');

puppeteer.use(StealthPlugin());
puppeteer.use(AnonymizeUAPlugin());

async function getDirectories(source) {
    const files = await asyncFs.readdir(source, { withFileTypes: true });
    return files.filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules' && dirent.name !== '.git').map(dirent => dirent.name);
}

function getInfoData(directory) {
    const filePath = path.join(directory, 'info.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonObject = JSON.parse(data);
        return jsonObject;
    } catch (err) {
        console.error('Error:', err);
    }
}

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function visitWebsite(page, url) {
    await page.goto(url, { waitUntil: 'load' });
}

async function clickButton(page, selectorType, selector) {
    if (selectorType === 'CSS') {
        await page.waitForSelector(selector);
        const button = await page.$(selector);
        await button.evaluate(button => button.click());
    } else {
        await page.waitForSelector('xpath/' + selector);
        const [button] = await page.$$('xpath/' + selector);
        await button.evaluate(button => button.click());
    }
}

async function typeText(page, selectorType, selector, text) {
    if (selectorType === 'CSS') {
        await page.waitForSelector(selector);
        await page.type(selector, text, { delay: 50 });
    } else {
        await page.waitForSelector('xpath/' + selector);
        await page.type('xpath/' + selector, text, { delay: 100 });
    }
}

async function getJpgFiles(directory) {
    try {
        const files = await asyncFs.readdir(directory);
        const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');
        const filePaths = jpgFiles.map(file => path.join(directory, file));
        return filePaths;
    } catch (err) {
        throw new Error(`Error reading directory: ${err.message}`);
    }
}

async function uploadMultipleFiles(page, files, selector) {
    await page.waitForSelector(selector);
    const elementHandle = await page.$(selector);
    await elementHandle.uploadFile(...files);
}

async function login(page) {
    // Set selectors for login
    const AUTH_BUTTON_SELECTOR = 'button';
    const EMAIL_SELECTOR = '#Email';
    const PASSWORD_SELECTOR = '#Password';
    const SUBMIT_SELECTOR = 'button';

    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    // Click on the authentication button
    await clickButton(page, 'CSS', AUTH_BUTTON_SELECTOR);
    // Type in email and password
    await typeText(page, 'CSS', EMAIL_SELECTOR, email);
    await typeText(page, 'CSS', PASSWORD_SELECTOR, password);
    // Click on the submit button
    await clickButton(page, 'CSS', SUBMIT_SELECTOR);
    await delay(70000);

}

async function fillFields(page, directory){
    // Get info data
    const infoData = getInfoData(directory);
    // Get jpg files to be uploaded
    const jpgFiles = await getJpgFiles(directory);
    const phone = process.env.PHONE;

    // Selectors for fields
    const REAL_ESTATE_SELECTOR = `(//div[@class='luk-flex luk-w-full luk-flex-row luk-flex-wrap luk-gap-3'])[1]/div[${(parseInt(infoData.realEstateType) + 1).toString()}]/label`;
    const AGREEMENT_SELECTOR = `(//div[@class='luk-flex luk-w-full luk-flex-row luk-flex-wrap luk-gap-3'])[2]/div[${(parseInt(infoData.agreementType) + 1).toString()}]/label`;
    const CITY_SELECTOR = `//span[contains(.,'Choose city')]/following-sibling::input`;
    const ADDRESS_SELECTOR = "//span[.='Enter street']/preceding-sibling::input";
    const NAME_SELECTOR = "//span[.='Name']/parent::div/following-sibling::div[1]/div[1]/div[1]/label/input";
    const PHONE_SELECTOR = "//span[.='Name']/parent::div/following-sibling::div[4]/div[1]/div[1]/label/input";
    const ROOMS_SELECTOR = `//span[.='Rooms']/parent::div/following-sibling::div[1]/div/div/div[${infoData.rooms.toString()}]/label`;
    const BEDROOM_SELECTOR = `//span[.='Bedroom']/parent::div/following-sibling::div[1]/div/div/div[${infoData.bedrooms.toString()}]/label`;
    const FLOOR_SELECTOR = `//span[normalize-space()='Floor']/parent::div/following-sibling::div[1]/div[1]/div/label/input`;
    const TOTAL_FLOOR_SELECTOR = `//span[normalize-space()='Floor']/parent::div/following-sibling::div[1]/div[2]/div/label/input`;
    const AREA_SELECTOR = `(//span[contains(.,'Area')])[3]/preceding-sibling::input`;
    const TOTAL_PRICE_SELECTOR = `//span[contains(.,'Total price')]/preceding-sibling::input`;
    const DESC_SELECTOR = "//textarea[@placeholder='Enter additional description']";
    const STATUS_SELECT_SELECTOR = `//span[.='Status']/parent::div/following-sibling::div[1]/div/div/div`;
    const STATUS_OPTION_SELECTOR = 'ul.options-list>li:nth-child(1)';
    const LIVO_SELECTOR = "//span[.='livo.ge']/parent::span/parent::div/preceding-sibling::div/button";
    const SERVICE_SELECTOR = `(//label/div/div/button[@role='checkbox'])[${(parseInt(infoData.vipStatus) + 1).toString()}]`;


    // Click on the real estate button
    await clickButton(page, 'XPATH', REAL_ESTATE_SELECTOR);
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
    // Click on the bedroom button
    await clickButton(page, 'XPATH', BEDROOM_SELECTOR);
    // Type text in floor 
    await typeText(page, 'XPATH', FLOOR_SELECTOR, infoData.floor);
    // Type text in total floors
    await typeText(page, 'XPATH', TOTAL_FLOOR_SELECTOR, infoData.totalFloors);
    // Type text in area
    await typeText(page, 'XPATH', AREA_SELECTOR, infoData.area);
    // Type text in total price
    await typeText(page, 'XPATH', TOTAL_PRICE_SELECTOR, infoData.priceUSD);
    // Type text in description
    await typeText(page, 'XPATH', DESC_SELECTOR, infoData.description);
    // Click on the select button
    await clickButton(page, 'XPATH', STATUS_SELECT_SELECTOR);
    // Click on the first list option
    await clickButton(page, 'CSS', STATUS_OPTION_SELECTOR);
    // Click on the livo checkbox
    await clickButton(page, 'XPATH', LIVO_SELECTOR);
    // Click on the service
    await clickButton(page, 'XPATH', SERVICE_SELECTOR);
    // Upload multiple files
    await uploadMultipleFiles(page, jpgFiles, 'input#browse');
    await delay(2000);
}

async function main() {
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
    const page = await browser.newPage();
    
    await visitWebsite(page, url);
    await login(page);

    const directories = await getDirectories('.');
    console.log(directories);
    for (const directory of directories) {
        await fillFields(page, directory);
    }

    await browser.close();
}

main();
