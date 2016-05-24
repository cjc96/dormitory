$('#upload_button').click(function ()
{
  
  if ($('#password_input').val() != $('#password_confirm_input').val())
  {
    $('#warning_words1').collapse('show');

    $('#warning_words2').collapse('hide');
    $('#warning_words3').collapse('hide');
    $('#warning_words4').collapse('hide');
    $('#warning_words5').collapse('hide');
  }
  else
  {
    $('#warning_words1').collapse('hide');
    if ($('#password_input').val() == '')
    {
      $('#warning_words4').collapse('show');

      $('#warning_words1').collapse('hide');
      $('#warning_words2').collapse('hide');
      $('#warning_words3').collapse('hide');
      $('#warning_words5').collapse('hide');
    }
    else
    {
      $('#warning_words4').collapse('hide');
      if ($("input:radio[name = 'options']:checked").val() == undefined)
      {
        $('#warning_words5').collapse('show');

        $('#warning_words1').collapse('hide');
        $('#warning_words2').collapse('hide');
        $('#warning_words3').collapse('hide');
        $('#warning_words4').collapse('hide');
      }
      else
      {
        $('#warning_words5').collapse('hide');
        $.post('/regUsernameCheck',
          {
            username : $('#username_input').val()
          }, function (data0, status0)
          {
            if (data0 == 'null')
            {
              $('#warning_words2').collapse('hide');
              $.post('/regAccount',
              {
                username : $('#username_input').val(),
                password : $('#password_input').val(),
                account_type : $("input:radio[name = 'options']:checked").val()
              }, function (data1, status1)
              {
                $('#warning_words3').collapse('show');

                $('#warning_words1').collapse('hide');
                $('#warning_words2').collapse('hide');
                $('#warning_words4').collapse('hide');
                $('#warning_words5').collapse('hide');
              });
            }
            else
            {
              $('#warning_words2').collapse('show');

              $('#warning_words1').collapse('hide');
              $('#warning_words3').collapse('hide');
              $('#warning_words4').collapse('hide');
              $('#warning_words5').collapse('hide');
            }
          });
        }
    }
  }
});