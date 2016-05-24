document.getElementById("sign_up").onclick = function () 
{
  location.href = "reg.html";
};

$('#login').click(function ()
  {
    $.post('/login', 
      {
        username : $('#form_username').val(),
        password : $('#form_password').val()
      },
      function (data, status)
      {
        data = JSON.parse(data);
        if (data.state == 'success')
        {
          $('#warning_words').collapse('hide');
          console.log('account_name = ' + $('#form_username').val());
          console.log('account_type = ' + data.type);
          Cookies.set('username',$('#form_username').val());
          Cookies.set('type',data.type);
          if (data.type == 'student')
          {
            location.href = "/loadStudent";
          }
          else if (data.type == 'instructor')
          {
            location.href = '/loadInstructor';
          }
          else if (data.type == 'admin')
          {
            location.href = '/loadAdmin';
          }
          else if (data.type == 'superadmin')
          {
            location.href = '/loadSuperadmin';
          }
          else
          {
            alert('Something go wrong!');
          }
        }
        else
        {
          $('#warning_words').collapse('show');
        }
      });
  });