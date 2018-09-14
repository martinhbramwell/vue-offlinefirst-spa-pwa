const chalk = require('chalk');
const CN = require('./constants');

const ids = {};
const cy = id => `//${ids[id]}[@data-cyp="${id}"]`;


const APP_TITLE = 'appTitle'; ids[APP_TITLE] = 'span';
const LOGIN_BUTTON = 'logIn'; ids[LOGIN_BUTTON] = 'a';
const LOGOUT_BUTTON = 'logOut'; ids[LOGOUT_BUTTON] = 'a';
const BTN_PURGE = 'purge'; ids[BTN_PURGE] = 'a';
const DIV_STATUS = 'status'; ids[DIV_STATUS] = 'div';
const DIV_ACTIVITY = 'activity'; ids[DIV_ACTIVITY] = 'div';


const URL_GOOGLE_PERMISSIONS = 'https://myaccount.google.com/permissions';
const H1_GOOGLE_LOGIN = '//h1[.="Sign in"]';

const INP_USER_EMAIL = '//input[@type="email"]';
const BTN_ID_NEXT = '//div[@id="identifierNext"]';

const INP_USER_PWD = '//input[@type="password"]';
const BTN_PWD_NEXT = '//div[@id="passwordNext"]';

const APP_LIST = '//div[@data-id]';
const APP_LIST_ITEM = `//div[@data-id]//div[contains(text(), "${CN.APP_NAME}")]`;
const USER_LIST_ITEM = `//p[.="${CN.GOOGLE_USER}"]`;
const BTN_REMOVE = `//div[@data-name="${CN.APP_NAME}"]`;

// const BTN_INSECURE = '//button[.=\'Insecure Request\']';
// const INP_RESPONSE = '//input[@id="output"]';

const OPTION_CONFIRM = '//div[contains(text(), "Remove access?")]';

const OAUTH_PROJ = `//button[@data-third-party-email="${CN.GOOGLE_PROJ}"]`;
const H1_NOT_VERIFIED = '//h1[.="This app isn\'t verified"]';
const BTN_ADVANCED = '//a[.="Advanced"]';
const BTN_PROCEED = '//a[.="Go to webtask.io (unsafe)"]';

// const MSG_CONFIRMED = `//content[contains(text(), "${CN.APP_NAME}")]`;
// const BTN_CONFIRMED = 'following::span[contains(text(), "OK")]/../..';

const H2_ALLOW = '//h2[.="Allow webtask.io to do this?"]';
const BTN_ALLOW = '//div[@id="submit_approve_access"]';

const LG = console.log; // eslint-disable-line no-console, no-unused-vars

module.exports = {

  'Purge GOOGLE user permissions': function test(browser) {
    if (!process.env[CN.GOOGLE_USER_PWD]) {
      const msg = `Need
      export GOOGLE_USER_PWD='xyz';`;
      LG(msg);
      throw msg;
    }

    browser
      .useXpath()
      .url(URL_GOOGLE_PERMISSIONS)
      .waitForElementVisible(H1_GOOGLE_LOGIN, 5000);

    browser.assert.elementPresent(INP_USER_EMAIL);

    browser.setValue(INP_USER_EMAIL, CN.GOOGLE_USER);
    browser.click(BTN_ID_NEXT);

    LG(` Is present?   ${chalk.blue(CN.GOOGLE_USER)}
${process.env[CN.GOOGLE_USER_PWD]}
                `);
    browser.waitForElementVisible(INP_USER_PWD, 5000);
    browser.setValue(INP_USER_PWD, process.env[CN.GOOGLE_USER_PWD]);
    browser.click(BTN_PWD_NEXT);

    browser.waitForElementVisible(APP_LIST, 45000);

    browser.elements('xpath', APP_LIST_ITEM, (elems) => {
      if (elems.value.length > 0) {
        LG(`Removing permissions for app '${CN.APP_NAME}'.`);
        browser.click(`${APP_LIST_ITEM}/../../..`);

        browser.waitForElementVisible(BTN_REMOVE, 45000);
        browser.click(BTN_REMOVE);

        browser.waitForElementVisible(OPTION_CONFIRM, 45000);
        browser.click('//content[contains(text(), "IridiumBlueClient")]/following::span[contains(text(), "OK")]/../..');
        browser.expect.element(OPTION_CONFIRM).to.not.be.present.after(10000);
        // browser.pause(10000);
      } else {
        LG(`No test needed. App '${CN.APP_NAME}' was not authorized.`);
      }
    });
  },

  'Log in to app': function test(browser) {
    const devServer = browser.globals.devServerURL;

    browser
      .url(devServer)
      .useCss()
      .waitForElementVisible('#app', 5000)
      .useXpath();

    // FUDGE ESLINT
    browser.expect.element(cy(APP_TITLE)).to.be.present.after(1000);
    browser.expect.element(cy(APP_TITLE)).text.to.contain('iridium blue');
  },

  'Purge MICROSERVICE user permissions': function test(browser) {
    browser.click(cy(BTN_PURGE));
    browser.expect.element(cy(DIV_STATUS)).text.to.match(/(OK|Unauthorized)/).after(10000);
  },

  'Verify Log in Sequence': function test(browser) {
    browser.assert.elementPresent(cy(LOGIN_BUTTON));
    browser.click(cy(LOGIN_BUTTON));

    browser.waitForElementVisible(OAUTH_PROJ, 5000);

    browser.elements('xpath', USER_LIST_ITEM, (elems) => {
      if (elems.value.length > 0) {
        LG(`Picking user '${CN.APP_NAME}' from list.`);
        browser.click(`${USER_LIST_ITEM}/../..`);
      } else {
        LG(`Authenticating as user '${CN.APP_NAME}'.`);
        browser.assert.elementPresent(INP_USER_EMAIL);

        browser.setValue(INP_USER_EMAIL, CN.GOOGLE_USER);
        browser.click(BTN_ID_NEXT);

        browser.waitForElementVisible(INP_USER_PWD, 5000);
        browser.setValue(INP_USER_PWD, process.env[CN.GOOGLE_USER_PWD]);
        browser.click(BTN_PWD_NEXT);
      }
    });

    // browser.pause(10000);
    browser.waitForElementVisible(H1_NOT_VERIFIED, 15000);
    browser.click(BTN_ADVANCED);

    browser.waitForElementVisible(BTN_PROCEED, 5000);
    browser.click(BTN_PROCEED);

    browser.waitForElementVisible(H2_ALLOW, 5000);
    browser.click(BTN_ALLOW);

    browser
      .waitForElementVisible(cy(APP_TITLE), 5000)
      .assert.containsText(cy(APP_TITLE), 'iridium blue');

    // browser.saveScreenshot('/home/you/Desktop/fail.jpg');
    browser.expect.element(cy(DIV_ACTIVITY)).text.to.contain('Activity 1').after(5000);
  },

  'Verify Log out Sequence': function test(browser) {
    browser.expect.element(cy(LOGOUT_BUTTON)).to.be.visible.after(5000);
    browser.click(cy(LOGOUT_BUTTON));

    browser.expect.element(cy(LOGOUT_BUTTON)).not.to.be.present.after(5000);
    // LG(`Activity '${cy(DIV_ACTIVITY)}'.`);
    // browser.pause(20000);
    browser.expect.element(cy(DIV_ACTIVITY)).to.be.present.after(5000);
    // browser.saveScreenshot('/home/you/Desktop/fail.jpg');
    browser.expect.element(cy(DIV_ACTIVITY)).text.to.contain('Activity 0').after(5000);

    browser.end();
  },
};
