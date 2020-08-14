$(document).ready(function () {
  $('.form-check-input').change(function (e) { 
    if ($('.form-check-input:checked').val() == 'custom') {
      $('.custom-row input').select();
    }
  });
});