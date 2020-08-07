const pupHelper = require('./puppeteerhelper');
let browser = false;

module.exports.launchBrowser = async () => {
  console.log('Launching Browser...');
  browser = await pupHelper.launchBrowser(false);
  browser.on("disconnected", async () => {
    await this.launchBrowser();
  });
}