var current_student = new String("NULL");
var current_applyment = new String("NULL");

$('#confirm_change_pwd').click(function ()
	{
		$.post('/changePwd', {'pwd': $('#change_pwd').val()});
	});

function showDis(id)
{
	$.post("/queryDiscipline", {'id': id}, function (data, status)
		{
			data = JSON.parse(data);
			$('#dis_student_num').val(data[0].id.toString());
			$('#dis_student_name').val(data[0].name);
			$('#dis_time').val(data[0].time);
			$('#dis_content').val(data[0].content);
		});
}

function showApply(id)
{
	current_applyment = id;
	$.post("/queryApplyById", {'id': id}, function (data, status)
		{
			data = JSON.parse(data);
			$('#apply_student_name').val(data[0].name);
			$('#apply_student_room').val(data[0].room);
			$('#apply_type').val(data[0].type);
			$('#apply_student_building').val(data[0].building);
			if (data[0].destination != null)
			{
				$('#apply_destination').val(data[0].destination);
			}
			else
			{
				$('#apply_destination').val("N/A");
			}
		});
}

$('#confirm_apply').click(function ()
	{
		if (current_applyment != "NULL")
		{
			$.post("/confirmApply",{'id': current_applyment});
		}
		else
		{
			alert("choose an applyment");
		}
	});

function showStudentInfo(username)
{
	current_student = username;
	if (username != 'NULL')
	{
		$.post('/queryStudentInfo', {'username': username}, function (data, status)
		{
			data = JSON.parse(data);
			$('#student_num').val(data[0].id.toString());
			$('#student_class').val(data[0].class);
			$('#student_name').val(data[0].name);
			$('#student_college').val(data[0].college);
			$('#student_building').val(data[0].dorm_building_num);
		});
	}
	else
	{
		$('#student_num').val('');
		$('#student_class').val('');
		$('#student_name').val('');
		$('#student_college').val('');
		$('#student_building').val('');
	}
	return false;
}

$('#changeStu').click(function ()
	{
		console.log(current_student);
		if (current_student == "NULL")
		{
			$.post('/newStudent', 
			{
				'username': $('#student_num').val(),
				'password': '123',
				'name': $('#student_name').val(),
				'class': $('#student_class').val(),
				'id': $('#student_num').val(),
				'college': $('#student_college').val(),
				'building_num': $('#student_building').val()
			}, function (data, status)
			{
				if (data == 'idExisted')
				{
					alert("Student ID existed!");
				}
				else if (data == 'success')
				{
					console.log('new a student successfully');
				}
				else
				{
					console.log('failed to new a student');
				}
			});
		}
		else
		{
			console.log(1);
			// TODO : 不修改学号会导致错误的bug
			$.post('/updateStudentInfo',
			{
				'name': $('#student_name').val(),
				'class': $('#student_class').val(),
				'id': $('#student_num').val(),
				'college': $('#student_college').val(),
				'username': current_student,
				'building_num': $('#student_building').val()
			}, function (data, status)
			{
				if (data == 'idExisted')
				{
					alert("Student ID existed!");
				}
				else if (data == 'success')
				{
					console.log('update a student successfully');
				}
				else
				{
					console.log('failed to update a student');
				} 
			});
		}
	// return false;
	});

function showStudentDormitory(username)
{
	$.post('/queryStudentDorm', {'username': username}, function (data, status)
		{
			data = JSON.parse(data);
			console.log(data[0].dorm_building_num == null);
			if (data[0].dorm_building_num != null)
			{
				$('#dorm_stu_building').html(data[0].dorm_building_num);
			}
			else
			{
				$('#dorm_stu_building').html('N/A');
			}
			if (data[0].dorm_room_num != null)
			{
				$('#dorm_stu_room').html(data[0].dorm_room_num);
				$('#dorm_stu_bed').html(data[0].bed_num);
			}
			else
			{
				$('#dorm_stu_room').html('N/A');
				$('#dorm_stu_bed').html('N/A');
			}
			$('#dorm_stu_name').html(data[0].name);
		});
	return false;
}