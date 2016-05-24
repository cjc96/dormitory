var current_equipment = new String("NULL");
var current_student = new String('NULL');
var current_penalty = new String('NULL');
var current_applyment = NaN;
var current_fix = NaN;
var current_room = NaN;

$('#change_capacity').click(function ()
	{
		$.post("/changeCapacity", 
		{
			'capacity': $('#process_room_capacity').val(),
			'room_num': current_room
		}, function (data, status)
		{
			if (data == "failed")
			{
				alert("容量不得小于现有人数");
			}
		});
	});

function showRoom(num)
{
	current_room = num;
	$.post("/queryRoomCapacity", {'room_num': num}, function (data, status)
		{
			$("#process_room_num").val(num);
			$('#process_room_capacity').val(data);
		});
}

$('#auto_distribute').click(function ()
	{
		$.get('/autoDistribute', function (data, status)
			{
				console.log(data);
				alert('自动分配完成,' + data);
			});
	});

$('#confirm_change_pwd').click(function ()
	{
		$.post('/changePwd', {'pwd': $('#change_pwd').val()});
	});

function showRepairApplyment(id)
{
	current_fix = id;
	$.post('/queryFixInfo', {'id': id}, function (data, err)
		{
			data = JSON.parse(data);
			$('#repair_name').val(data[0].name);
			$('#repair_time').val(data[0].date);
			$('#repair_equip_id').val(data[0].id);
			$('#repair_room_num').val(data[0].room_num);
		});
}

$('#fix_failed').click(function ()
	{
		$.post("/fixFailed", {'id': current_fix});
	});

$('#fix_success').click(function ()
	{
		$.post("/fixSuccess", {'id': current_fix});
	});

function showApplyment(id)
{
	current_applyment = id;
	$.post('/queryApplyById', {'id': id}, function (data, err)
		{
			data = JSON.parse(data);
			$('#apply_stu_room').val(data[0].room);
			$('#apply_stu_name').val(data[0].name);
			$('#apply_stu_type').val(data[0].type);
			if (data[0].destination != null)
			{
				$('#apply_stu_destination').val(data[0].destination);
			}
			else
			{
				$('#apply_stu_destination').val("N/A");
			}
		});
}

$('#reject_apply').click(function ()
	{
		$.post('/rejectApply', {'id': current_applyment});
	});

$('#recept_apply').click(function ()
	{
		$.post('/receptApply', {'id': current_applyment});
	});

function penalize(username)
{
	current_penalty = username;
	$.post('/queryStudentInfo', {'username': username}, function (data, status)
	{
		data = JSON.parse(data);
		$('#penalty_name').val(data[0].name);
	})
}

$('#confirm_penalty').click(function ()
	{
		if (current_penalty == 'NULL')
		{
			alert("请选择一个学生");
		}
		else
		{
			$.post('/newDiscipline',
			{
				'username': current_penalty,
				'date': $('#penalty_time').val(),
				'content': $('#penalty_content').val()
			})
		}
		return false;
	});

function distributeStu(username)
{
	current_student = username;
	$.post('/queryStudentDorm', {'username': username}, function (data, status)
	{
		data = JSON.parse(data);
		$('#dorm_stu_name').val(data[0].name);
		if (data[0].dorm_room_num != null)
		{
			$('#dorm_stu_room').val(data[0].dorm_room_num.toString());
			$('#dorm_stu_bed').val(data[0].bed_num.toString());
		}
		else
		{
			$('#dorm_stu_room').val("N/A");
			$('#dorm_stu_bed').val("N/A");
		}
	});
}

$('#confirm_distribute').click(function ()
	{
		if (current_student != "NULL")
		{
			if ($('#dorm_stu_room').val() != null && $('#dorm_stu_bed').val() != null)
			{
				$.post("/distributeStudent",
				{
					'username': current_student,
					'room_num': $('#dorm_stu_room').val(),
					'bed_num': $('#dorm_stu_bed').val()
				}, function (data, status)
				{
					if (data == "failed")
					{
						alert("床位非空");
					}
				});
			}
			else
			{
				alert('请完整输入信息');
			}
		}
		else
		{
			alert("请选择一个学生");
		}
		return false;
	});


function showEquipment(id_string)
{
	current_equipment = id_string;
	if (id_string == "NULL")
	{
		$('#equip_id').val('');
		$('#equip_name').val('');
		$('#equip_time').val('');
		$('#equip_room_num').val('');
		$('#equip_state').val('');
		$('#equip_state').attr('style','');
	}
	else
	{
		$.post("/queryEquipmentInfo", {'id': id_string}, function (data, status)
			{
				data = JSON.parse(data);
				$('#equip_id').val(data[0].id.toString());
				$('#equip_name').val(data[0].name);
				$('#equip_time').val(data[0].time);
				$('#equip_room_num').val(data[0].dorm_room_num);
				if (data[0].state == "working")
				{
					$('#equip_state').attr("style","font-size:20px;color:white;background-color:green");
					$('#equip_state').val(data[0].state);
				}
				else
				{
					$('#equip_state').attr("style","font-size:20px;color:white;background-color:red");
					$('#equip_state').val(data[0].state);
				}
			});
	}
}

$('#change_equipment').click(function ()
	{
		if (current_equipment == "NULL")
		{
			$.post("/newEquipment",
			{
				'equip_name': $('#equip_name').val(),
				'equip_time': $('#equip_time').val(),
				'equip_room_num': $('#equip_room_num').val()
			});
		}
		else
		{
			$.post("updateEquipmentInfo",
			{
				'equip_id' : current_equipment,
				'equip_name': $('#equip_name').val(),
				'equip_time': $('#equip_time').val(),
				'equip_room_num': $('#equip_room_num').val()
			});
		}
	});

$('#remove_equipment').click(function ()
	{
		if (current_equipment == "NULL")
		{
			alert("请选择一个设备");
		}
		else
		{
			$.post('/removeEquipment', {'id' : current_equipment});
		}
	});