const pupHelper = require('./puppeteerhelper');
let browser = false;

module.exports.launchBrowser = async () => {
  console.log('Launching Browser...');
  browser = await pupHelper.launchBrowser();
  browser.on("disconnected", async () => {
    await this.launchBrowser();
  });
}

module.exports.launchPage = async () {
  const page = await pupHelper.launchPage(browser);
  return page;
}