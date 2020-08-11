const puppeteerHelper = require('../helpers/puppeteerhelper');

module.exports.details_post = (req, res, next) => {
  const query = {
    trackUrl: req.body.trackUrl,
    startAt: Number(req.body.startAt),
    endAt: Number(req.body.endAt),
    finalCheck: req.body.finalCheck,
    finalCheckSeconds: req.body.finalCheckSeconds ? Number(req.body.finalCheckSeconds) : 0,
  }
  console.log('Query: ', query);
  res.render('details', {query});
} 

module.exports.pagedata_post = async (req, res, next) => {
  const pageData = {};
  const trackURL = req.body.trackUrl;
  const browser = await puppeteerHelper.launchBrowser(true);
  console.log('Launched browser');
  try {
    const page = await puppeteerHelper.launchPage(browser, false);
    console.log('launched page...');
    await page.goto(trackURL, {
      waitUntil: 'networkidle2'
    });
    await page.waitForSelector('.raceNo');
    await page.waitForSelector('.titleAccordion .oddsheadMtp');

    pageData.MTP = await puppeteerHelper.getTxt('.titleAccordion .oddsheadMtp', page);
    pageData.MTP = Number(pageData.MTP.match(/.*(?=\n)/g)[0]);
    if (isNaN(pageData.MTP)) pageData.MTP = 0;
    pageData.raceNumber = await puppeteerHelper.getTxt('.raceNo', page);
    pageData.trackName = await puppeteerHelper.getTxt('.titleAccordion .titleTrack', page);
    pageData.trackName = pageData.trackName.match(/.*(?=[\n\r])/g)[0];
    pageData.horsesNames = await puppeteerHelper.getTxtMultiple('.headRow .saddleNo > .oddsNo', page);
    pageData.tableData = await puppeteerHelper.getTxtMultiple('.oddsPoolsBody .dataTable.listBody li > .sCell.valpoolWin:not(.poolPercentage)', page);
    pageData.tableData = pageData.tableData.map(td => {
      if (td == '--') {
        return 0;
      } else {
        return Number(td);
      }
    })
    pageData.total = pageData.tableData.reduce((a, b) => a + b);
    pageData.status = 'SUCCESS';
    console.log(pageData);
    await page.close();
    await browser.close();
    console.log('Browser closed...');

    res.json(pageData);
  } catch (error) {
    await browser.close();
    console.log(error);
    pageData.status = 'ERROR';
    pageData.error = error.stack;
    res.json(pageData);
  }
};