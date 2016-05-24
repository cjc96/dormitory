var current_equipment = NaN;

$('#confirm_change_pwd').click(function ()
	{
		$.post('/changePwd', {'pwd': $('#change_pwd').val()});
	});


function showEquipment(id)
{
	current_equipment = id;
	$.post("/queryEquipmentInfo", {'id': id}, function (data, status)
		{
			data = JSON.parse(data);
			$('#dorm_equip_id').html(data[0].id.toString());
			$('#dorm_equip_time').html(data[0].time);
			if (data[0].state == "working")
			{
				$('#dorm_equip_state').attr("style","font-size:20px;color:white;background-color:green");
				$('#dorm_equip_state').html(data[0].state);
			}
			else
			{
				$('#dorm_equip_state').attr("style","font-size:20px;color:white;background-color:red");
				$('#dorm_equip_state').html(data[0].state);
			}
		});

	$.post('/queryRepairHistory', {'id': id}, function (data,status)
		{
			$('#equipment_feedback').html(data);
		});
}

$('#report_a_repair').click(function ()
	{
		if (current_equipment != NaN)
		{
			var myDate = new Date();
			$.post("/newFix", 
			{
				'id': current_equipment,
				'date': myDate.toLocaleString()
			});
		}
		else
		{
			alert('choose an equipment');
		}
	});

$('#change_dorm_confirm').click(function ()
	{

		$.post("/newApplyment", 
		{
			'type': "change",
			'destination': $('#building_destination').val(),
		});
		return false;
	});

$('#abandon_dorm_confirm').click(function ()
	{
		$.post("newApplyment",
		{
			'type': "abandon",
			'destination': NaN
		});
		return false;
	});