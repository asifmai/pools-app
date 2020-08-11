var pageData = [];

$(document).ready(function () {
  console.log(query);
  axios.post('/pagedata', {
      trackUrl: query.trackUrl
    })
    .then(function (resp) {
      var data = resp.data;
      if (data.status === 'SUCCESS') {
        console.log(data);
        addPageData(data);
        startTimer();
        if (data.MTP == query.startAt) {
          pageData.push(data);
          $('.info__detail#nextCheck').text(query.finalCheckSeconds + ' Seconds After ' + query.endAt + ' MTP');
        } else {
          $('.info__detail#nextCheck').text(query.startAt);
        }
      } else {
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(data.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      }
    });

});

function startTimer() {
  console.log('Started Timer...')
  var intervalFunc = setInterval(function () {
    axios.post('/pagedata', {
        trackUrl: query.trackUrl
      })
      .then((resp) => {
        var data = resp.data;
        if (data.status === 'SUCCESS') {
          console.log(data);
          if (Number($('.info__detail#mtp').text()) !== data.MTP) {
            if (data.MTP == query.startAt) {
              $('.info__detail#nextCheck').text(query.finalCheckSeconds + ' Seconds After ' + query.endAt + ' MTP');
              pageData.push(data);
            } else if (data.MTP == query.endAt) {
              clearInterval(intervalFunc);
              startTimer0();
            }
          }
          updatePageData(data);
        } else {
          $('.loader-overlay').css('display', 'block');
          $('.loader-overlay i').css('display', 'none');
          $('.loader-overlay .error__msg').text(data.error);
          $('.loader-overlay .error__msg').css('display', 'block');
        }
      });
  }, 30000);
}

function startTimer0() {
  console.log('Running timer 0 function');
  var timeoutFunc = setTimeout(() => {
    axios.post('/pagedata', {
      trackUrl: query.trackUrl
    })
    .then((resp) => {
      var data = resp.data;
      if (data.status === 'SUCCESS') {
        pageData.push(data);
        updatePageData(data);
        addChangeColumn();
        $('.info__detail#mtp').text(data.MTP);
      } else {
        $('.loader-overlay').css('display', 'block');
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(data.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      }
    });
  }, query.finalCheckSeconds * 1000);
}

function addPageData(data) {
  $('.loader-overlay').css('display', 'none');
  document.title = data.trackName;
  $('.info__detail#trackname').text(data.trackName);
  $('.info__detail#racenumber').text(data.raceNumber);
  $('.info__detail#numberofhorses').text(data.horsesNames.length);
  $('.info__detail#mtp').text(data.MTP);

  for (let i = 0; i < data.tableData.length; i++) {
    $('.race__table tbody').append('<tr class="' + data.horsesNames[i] + '"></tr>');
    $('.race__table tbody tr.' + data.horsesNames[i]).append('<td class="table-primary" scope="col">' + data.horsesNames[i] + '</td>')
    $('.race__table tbody tr.' + data.horsesNames[i]).append('<td>' + data.tableData[i] + '</td>')
  }
  $('<tr><td class="table-primary" scope="col">Total</td><td>' + data.total + '</td></tr>').appendTo('.race__table tbody');
}

function updatePageData(data) {
  $('.info__detail#mtp').text(data.MTP);
  $('.race__table tbody').html('');

  for (let i = 0; i < data.tableData.length; i++) {
    $('.race__table tbody').append('<tr class="' + data.horsesNames[i] + '"></tr>');
    $('.race__table tbody tr.' + data.horsesNames[i]).append('<td class="table-primary" scope="col">' + data.horsesNames[i] + '</td>')
    $('.race__table tbody tr.' + data.horsesNames[i]).append('<td>' + data.tableData[i] + '</td>')
  }
  $('<tr><td class="table-primary" scope="col">Total</td><td>' + data.total + '</td></tr>').appendTo('.race__table tbody');
}

function addChangeColumn() {
  const changes = [];
  let total = 0;
  console.log(`Number of pageData: ${pageData.length}`);
  if (pageData.length == 2) {
    for (let i = 0; i < pageData[0].horsesNames.length; i++) {
      const change = pageData[1].tableData[i] - pageData[0].tableData[i];
      changes.push(change);
    }
    total = changes.reduce((a,b) => a + b);

    $('<td class="table-primary">Change</td>').appendTo('.race__table tbody > tr:first-child');
    $('<td class="table-primary">Percentage</td>').appendTo('.race__table tbody > tr:first-child');
    for (let i = 0; i < changes.length; i++) {
      $('<td>' + changes[i] + '</td>').appendTo('.race__table tbody > tr:nth-child(' + (i + 1) + ')');
      const perc = (changes[i] / total) * 100;
      $('<td>' +  perc + '</td>').appendTo('.race__table tbody > tr:nth-child(' + (i + 1) + ')');
    }
    $('<td>' + total + '</td>').appendTo('.race__table tbody > tr:last-child');
    $('<td>100%</td>').appendTo('.race__table tbody > tr:last-child');
  }

}

function calcChange() {
  if (pageData.length > 1) {
    pageData[pageData.length - 1].change = [];
    for (let i = 0; i < pageData[pageData.length - 1].tableData.length; i++) {
      var diffArray = [];
      for (let j = 0; j < pageData[pageData.length - 1].tableData[i].length; j++) {
        var diff = (pageData[pageData.length - 1].tableData[i][j] - pageData[pageData.length - 2].tableData[i][j]);
        var diffInPerc = (diff / pageData[pageData.length - 2].tableData[i][j]) * 100;
        if (!diffInPerc) {
          diffInPerc = 0
        };
        diffArray.push(diffInPerc);
      }
      pageData[pageData.length - 1].change.push(diffArray);
    }

    pageData[pageData.length-1].winOddsChange = [];
    for (var i = 0; i < pageData[pageData.length-1].winOdds.length; i++) {
      if (pageData[pageData.length-2].winOdds[i] !== '' && pageData[pageData.length-2].winOdds[i].includes('-')) {
        var prevNom = Number(pageData[pageData.length-2].winOdds[i].match(/\d*(?=\-)/gi)[0]);
        var prevDenom = Number(pageData[pageData.length-2].winOdds[i].match(/(?<=\-)\d*/gi)[0]);
        var previousOdds = prevNom / prevDenom;
        var currentNom = Number(pageData[pageData.length-1].winOdds[i].match(/\d*(?=\-)/gi)[0]);
        var currentDenom = Number(pageData[pageData.length-1].winOdds[i].match(/(?<=\-)\d*/gi)[0]);
        var currentOdds = currentNom / currentDenom;
        var diffOdds = currentOdds - previousOdds;
        pageData[pageData.length-1].winOddsChange.push(diffOdds);
      } else {
        pageData[pageData.length-1].winOddsChange.push(0);
      }
    }
  }
  console.log(pageData);
}