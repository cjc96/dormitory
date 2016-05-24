var current_instructor = new String();
var current_administrator = new String();

function showInstr(username)
{
	current_instructor = username;
	$.post('/queryNameAndClass', {'username': username}, function (data, status)
		{
			data = JSON.parse(data);
			$('#instructor_name').val(data[0].name);
			$("#instructor_class").val(data[0].class);
		});


	return false;
}

$('document').ready(function ()
	{
		console.log('hehe');
		$.get('/haha', function (data, status)
		{
			console.log('hahaha');
		});
	});

function showAdmin(username)
{
	current_administrator = username;
	$.post('/queryNameAndBuilding', {'username': username}, function (data, status)
		{
			data = JSON.parse(data);
			$("#administrator_name").val(data[0].name);
			$("#administrator_building").val(data[0].building_num.toString());
		});
	return false;
}

$('#changeInstr').click(function ()
	{
		if (current_instructor.length == 0)
		{
			alert('please choose an instructor!!');
		}
		else
		{
			$.post('/changeInstr',
			{
				'username': current_instructor,
				'name': $('#instructor_name').val(),
				'class': $('#instructor_class').val()
			}, function (data, status)
			{
				if (data == 'success')
				{
					console.log("Instructor's info changed");
				}
				else
				{
					console.log("Change failed");
				}
			});
		}
		return false;
	});

$('#changeAdmin').click(function ()
	{
		if (current_administrator.length == 0)
		{
			alert('please choose an administrator!!');
		}
		else
		{
			$.post('/changeAdmin',
			{
				'username': current_administrator,
				'name': $('#administrator_name').val(),
				'building_num': $('#administrator_building').val()
			}, function (data, status)
			{
				if (data == 'success')
				{
					console.log("Administrator's info changed");
				}
				else
				{
					console.log("Change failed");
				}
			});
		}
		return false;
	});