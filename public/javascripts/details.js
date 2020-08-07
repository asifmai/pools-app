var pageData = [];
var updateWinOdds = new Array();
var updateTable = new Array(); 

$(document).ready(function () {
  console.log(query);
  axios.post('/pagedata', {
      trackurl: query.trackUrl
    })
    .then(function (resp) {
      var response = resp.data;
      if (response.status === 'SUCCESS') {
        console.log(response);
        pageData.push(response);
        addPageData(response);
        updateWinOdds = response.winOdds.map(wo => true);
        updateTable.length = response.tableData.length;
        for (let i = 0; i < updateTable.length; i++) {
          updateTable[i] = response.tableData.map(td => true);
        }
        startTimer();
      } else {
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(response.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      }
    });

    $(document).on('click', 'table.race__table tbody tr td:not(:first-of-type), table.saddle__table tbody tr td:not(:first-of-type)', function (e) { 
      if ($(this).hasClass('blacked')) {
        $(this).removeClass('blacked');
      } else {
        $(this).addClass('blacked');
      }
    });

    $(document).on('click', 'table.race__table tbody tr td:first-of-type', function (e) {
      if ($(this).parent().hasClass('rowblacked')) {
        $(this).parent().removeClass('rowblacked');
        $(this).parent().children().each(function(index) {
          if (index > 0) {
            $(this).removeClass('blacked');
          }
        })
      } else {
        $(this).parent().addClass('rowblacked');
        $(this).parent().children().each(function(index) {
          if (index > 0) {
            $(this).addClass('blacked');
          }
        })
      }
    });
});

function startTimer() {
  console.log('Running minute by minute function')
  var intervalFunc = setInterval(function () {
    axios.post('/pagedata', {
        trackurl: trackurl
      })
      .then((resp) => {
        var response = resp.data;
        if (response.status === 'SUCCESS') {
          if ($('.info__detail#mtp').text() !== response.MTP) {
            pageData.push(response);
            calcChange();
            updatePageData();
            if (response.MTP == '0') {
              clearInterval(intervalFunc);
              startTimer0();
            }
          }
          $('.info__detail#mtp').text(response.MTP);
        } else {
          $('.loader-overlay').css('display', 'block');
          $('.loader-overlay i').css('display', 'none');
          $('.loader-overlay .error__msg').text(response.error);
          $('.loader-overlay .error__msg').css('display', 'block');
        }
      });
  }, 30000);
}

function startTimer0() {
  console.log('Running timer 0 function');
  var timeoutFunc = setTimeout(() => {
    axios.post('/pagedata', {
      trackurl: trackurl
    })
    .then((resp) => {
      var response = resp.data;
      if (response.status === 'SUCCESS') {
        pageData.push(response);
        calcChange();
        updatePageData();
        $('.info__detail#mtp').text(response.MTP);
      } else {
        $('.loader-overlay').css('display', 'block');
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(response.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      }
    });
  }, 90000);
}

function addPageData(data) {
  $('.loader-overlay').css('display', 'none');
  document.title = data.trackName;
  $('.info__detail#trackname').text(data.trackName);
  $('.info__detail#racenumber').text(data.raceNumber);
  $('.info__detail#numberofhorses').text(data.horsesNames.length);
  $('.info__detail#mtp').text(data.MTP);

  for (let i = 0; i < data.horsesNames.length; i++) {
    var horseNameNode = '<th>' + data.horsesNames[i] + '</th>';
    $('.race__table thead tr').append(horseNameNode);
    $('.saddle__table thead tr').append(horseNameNode);
  }

  $('.saddle__table tbody tr').append('<td></td>')
  
  for (let i = 0; i < data.winOdds.length; i++) {
    $('.saddle__table tbody tr').append('<td>'+ data.winOdds[i]  +'</td>')
  }

  for (let i = 0; i < data.tableData.length; i++) {
    $('.race__table tbody').append('<tr class="' + data.horsesNames[i] + '"></tr>');
    $('.race__table tbody tr.' + data.horsesNames[i]).append('<td class="table-primary" scope="col">' + data.horsesNames[i] + '</td>')
    for (let a = 0; a < data.tableData[i].length; a++) {
      $('.race__table tbody tr.' + data.horsesNames[i]).append('<td>' + data.tableData[i][a] + '</td>')
    }
  }
}

function updatePageData() {
  var cData = pageData[pageData.length - 1];

  for (let i = 0; i < cData.winOdds.length; i++) {
    if (updateWinOdds[i]) {
      var decidedClass = '';
      if (cData.winOddsChange[i] !== 0) {
        updateWinOdds[i] = false;
        if (cData.winOddsChange[i] < 0) {
          decidedClass = 'table-success';
        } else {
          decidedClass = 'table-danger';
        }
      }
      var sel = '.saddle__table tbody tr:nth-of-type(1) td:nth-of-type(' + (i + 2) + ')';
      $(sel).addClass(decidedClass);      
      var htmlToAppend = cData.winOdds[i]  + '<sup>(' + pageData[pageData.length-2].winOdds[i] + ')</sup>';
      $(sel).html(htmlToAppend);
    }
  }

  for (let i = 0; i < cData.tableData.length; i++) {
    for (let j = 0; j < cData.tableData[i].length; j++) {
      if (updateTable[i][j]) {
        var sign = '&darr;';
        var alertClass = '';
        var diffInPerc = cData.change[i][j];
        var diffAbsRound = Math.abs(Math.round(diffInPerc));
        if (diffInPerc >= 0) sign = '&uarr;';
        
        if (diffInPerc <= -15 && updateTable[i][j]) {
          updateTable[i][j] = false;
        }
  
        if (diffInPerc <= -50) alertClass = 'table-warning'
        else if (diffInPerc <= -25) alertClass = 'table-danger'
        else if (diffInPerc <= -15) alertClass = 'table-success'
        
        const sel = '.race__table tbody tr:nth-of-type(' + (i + 1) +') td:nth-of-type(' + (j + 2) + ')';
        $(sel).addClass(alertClass);
        var htmlToAppend = cData.tableData[i][j] + '<sup title="' + diffInPerc + '">(' + sign + diffAbsRound + '%)</sup>';
        $(sel).html(htmlToAppend);
      }
    }
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