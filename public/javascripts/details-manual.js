var pageData = [];
var audio = new Howl({
  src: ['/sounds/notif.mp3', '/sounds/notif.ogg']
});
var intervalFunc;

$(document).ready(function () {

  $('#manualUpdate').click(function (e) { 
    e.preventDefault();
    clearInterval(intervalFunc);
    finalCheck();
  });

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
          $('.info__detail#nextCheck').text('Manual');
          document.getElementById('manualUpdate').disabled = false;
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
  intervalFunc = setInterval(function () {
    axios.post('/pagedata', {
        trackUrl: query.trackUrl
      })
      .then((resp) => {
        var data = resp.data;
        if (data.status === 'SUCCESS') {
          console.log(data);
          if (Number($('.info__detail#mtp').text()) !== data.MTP) {
            if (data.MTP == query.startAt) {
              $('.info__detail#nextCheck').text('Manual');
              document.getElementById('manualUpdate').disabled = false;
              pageData.push(data);
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

function finalCheck() {
  console.log('Final Check...');
  axios.post('/pagedata', {
    trackUrl: query.trackUrl
  })
  .then((resp) => {
    var data = resp.data;
    if (data.status === 'SUCCESS') {
      pageData.push(data);
      updatePageData(data);
      addChangeColumn();
      audio.play();
      $('.info__detail#mtp').text(data.MTP);
    } else {
      $('.loader-overlay').css('display', 'block');
      $('.loader-overlay i').css('display', 'none');
      $('.loader-overlay .error__msg').text(data.error);
      $('.loader-overlay .error__msg').css('display', 'block');
    }
  });
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

    $('<th class="table-primary">Change</th>').appendTo('.race__table thead > tr:first-child');
    $('<th class="table-primary">Percentage</th>').appendTo('.race__table thead > tr:first-child');
    for (let i = 0; i < changes.length; i++) {
      $('<td>' + changes[i] + '</td>').appendTo('.race__table tbody > tr:nth-child(' + (i + 1) + ')');
      const perc = Math.round((changes[i] / total) * 100);
      $('<td>' +  perc + '</td>').appendTo('.race__table tbody > tr:nth-child(' + (i + 1) + ')');
    }
    $('<td>' + total + '</td>').appendTo('.race__table tbody > tr:last-child');
    $('<td>100%</td>').appendTo('.race__table tbody > tr:last-child');
  }

}
