// 调用express框架 
var express = require('express');
var app = express();
 // 调用body-parser框架，解析post数据 
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
 // 调用mysql框架，处理数据库 
var db = require('mysql');
var database = db.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'shcjcis96',
  database : 'dormitory'
});
database.connect(function (err)
{
    if (err)
    {
      console.error('error connecting: ' + err.stack);
      return;
    }
});
/* 使用模板swig */
var swig  = require('swig');
// 调用cookie-parser解析cookies 
var cookieParser = require('cookie-parser');
app.use(cookieParser());
/* 使用静态文件中间件 */
app.use(express.static('public'));
// 文件上传控制
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var execute = require('child_process').exec;


/* 以下正文 */
// socket.io相关
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get("/message", function(req, res)
  {
    res.sendfile("public/html/message.html", function ()
      {
        res.end();
      });
  });

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


/* 主页重定向 */
app.get('/', function(req, res)
{
  res.redirect("/html/index.html");
  res.end();
});

app.get("/downloadXML", function (req, res)
  {
    execute("/usr/local/mysql/bin/mysql -X -u root --password=shcjcis96 -e 'use dormitory; select * from account; select * from student; select * from instructor; select * from admin;' > download.xml", function (err, stdout, stderr)
      {
        res.download("download.xml", function (err)
          {
            console.log(err);
            console.log(1);
            res.end();
          });
      });
  });

// 自动分配
app.get('/autoDistribute', function(req, res)
  {
    var query_string = "select account_username from student where bed_num is null and dorm_building_num = " + req.cookies.building_num + " order by id;";
    database.query(query_string, function (err, res1)
      {
        query_string = "select room_num, bed_num from (SELECT p1 AS building_num, p2 AS room_num, p3 AS bed_num FROM (SELECT d.building_num AS p1, d.room_num AS p2, number.num AS p3 FROM dorm AS d, ((SELECT 1 AS num) UNION (SELECT 2 AS num) UNION (SELECT 3 AS num) UNION (SELECT 4 AS num) UNION (SELECT 5 AS num) UNION (SELECT 6 AS num)) AS number WHERE number.num <= d.capacity ORDER BY room_num , num) AS table_1 LEFT JOIN (SELECT dorm_building_num AS q1, dorm_room_num AS q2, bed_num AS q3 FROM student WHERE bed_num IS NOT NULL) AS table_2 ON (p1 = q1 AND p2 = q2 AND p3 = q3) WHERE q3 IS NULL ORDER BY building_num , room_num , bed_num) as table_3 where building_num = " + req.cookies.building_num + ";";
        database.query(query_string, function (err, res2)
          {
            var limit =  res1.length > res2.length ? res2.length : res1.length;
            var count = 0;
            var respond = new String();
            if (limit != 0)
            {
              if (res1.length > res2.length)
              {
                respond = "床位不足";
              }
              else if (res1.length == res2.length)
              {
                respond = "床位正好";
              }
              else
              {
                respond = "床位剩余";
              }
              
              for (var i = 0; i < limit; i++)
              {
                query_string = "update student set dorm_room_num = " + res2[i].room_num + ", bed_num = " + res2[i].bed_num + " where account_username = " + database.escape(res1[i].account_username) + ";";
                // console.log(query_string);
                database.query(query_string, function ()
                  {
                      if (++count == limit)
                      {
                        res.end(respond);
                      }
                  });
              }
            }
            else
            {
              res.end("无空床或无空人");
            }
          });
      });
  });

// 渲染各个不同账户页面
app.get('/loadAdmin', function (req, res)
  {
    var query_string = "select * from admin where account_username = " + database.escape(req.cookies.username) + ";";
    var swigRespond = new Object();
    swigRespond['my_username'] = req.cookies.username;
    database.query(query_string, function (err, res1)
      {
        swigRespond['my_name'] = res1[0].name;
        swigRespond['my_building'] = res1[0].building_num;
        query_string = "select name, account_username from student where dorm_building_num = " + res1[0].building_num + ";";
        database.query(query_string, function (err, res2)
        {
          var studentList = new Array();
          for (var i = 0; i < res2.length; i++)
          {
            var stu = new Object();
            stu['name'] = res2[i].name;
            stu['account'] = res2[i].account_username;
            studentList.push(stu);
          }
          swigRespond['my_stu_num'] = res2.length;
          swigRespond['students'] = studentList;
          query_string = "select * from equipment where dorm_building_num = " + res1[0].building_num + ';';
          database.query(query_string, function (err, res3)
            {
              var equipmentList = new Array();
              for (var i = 0; i < res3.length; i++)
              {
                var equip = new Object();
                equip['id'] = res3[i].id;
                equip['name'] = res3[i].name;
                equipmentList.push(equip);
              }
              swigRespond['equipments'] = equipmentList;
              query_string = "select fix.id as fix_id from fix, equipment where fix.state = 'pending' and fix.equipment_id = equipment.id and equipment.dorm_building_num = " + res1[0].building_num + ";";
              database.query(query_string, function (err, res4)
                {
                  var repairList = new Array();
                  for (var i = 0; i < res4.length; i++)
                  {
                    repairList.push(res4[i].fix_id);
                  }
                  swigRespond['repair_applyments'] = repairList;
                  query_string = "select applyment.id as apply_id from applyment, student where applyment.state = 'pending' and applyment.student_account_username = student.account_username and student.dorm_building_num = " + res1[0].building_num + ";";
                  database.query(query_string, function (err, res5)
                  {
                    var applymentList = new Array();
                    for (var i = 0; i < res5.length; i++)
                    {
                      applymentList.push(res5[i].apply_id);
                    }
                    swigRespond['applyments'] = applymentList;
                    query_string = "select room_num from dorm where building_num = " + res1[0].building_num + ";";
                    database.query(query_string, function (err, res6)
                      {
                        var roomList = new Array();
                        for (var i = 0; i < res6.length; i++)
                        {
                          roomList.push(res6[i].room_num);
                        }
                        swigRespond['rooms'] = roomList;
                        var temp = swig.renderFile('public/html/admin.html', swigRespond);
                        res.end(temp);
                      });
                    
                  });
                });
            });
        });
      });
  });

app.get('/loadStudent', function (req, res)
  {
    var query_string = "select * from student where account_username = " + database.escape(req.cookies.username) + ";";
    var swigRespond = new Object();
    database.query(query_string, function (err, res1)
      {
        swigRespond['my_name'] = res1[0].name;
        swigRespond['my_class'] = res1[0].class;
        swigRespond['my_id'] = res1[0].id;
        swigRespond['my_college'] = res1[0].college;
        swigRespond['my_dorm_room'] = res1[0].dorm_room_num;
        swigRespond['my_dorm_building'] = res1[0].dorm_building_num;
        swigRespond['my_bed_num'] = res1[0].bed_num;
        swigRespond['my_account'] = req.cookies.username;
        query_string = "select * from discipline where student_account_username = " + database.escape(req.cookies.username) + ';';
        database.query(query_string, function (err, res2)
          {
            var disciplineList = new Array();
            for (var i = 0; i < res2.length; i++)
            {
              disciplineList.push(res2[0]);
            }
            swigRespond['disciplines'] = disciplineList;
            if (res1[0].dorm_room_num != null && res1[0].dorm_building_num != null)
            {
              query_string="select capacity from dorm where room_num = " + parseInt(res1[0].dorm_room_num) + " and building_num = " + parseInt(res1[0].dorm_building_num) +";";
              database.query(query_string, function (err, res3)
                {
                  swigRespond['my_dorm_capacity'] = res3[0].capacity;
                  query_string = "select name from student where dorm_room_num = " + res1[0].dorm_room_num + " and dorm_building_num = " + res1[0].dorm_building_num + ";";
                  database.query(query_string, function (err, res4)
                    {
                      var roommateList = new Array();
                      for (var i = 0; i < res4.length; i++)
                      {
                        roommateList.push(res4[i].name);
                      }
                      swigRespond['roommates'] = roommateList;
                      swigRespond['my_mates_num'] = res4.length;
                      query_string = 'select name, id from equipment where dorm_room_num = ' + res1[0].dorm_room_num + " and dorm_building_num = " + res1[0].dorm_building_num + ";";
                      database.query(query_string, function (err, res5)
                      {
                        var equipmentList = new Array();
                        for (var i = 0; i < res5.length; i++)
                        {
                          var equip = new Object();
                          equip['id'] = res5[i].id;
                          equip['name'] = res5[i].name;
                          equipmentList.push(equip);
                        }
                        swigRespond['equipments'] = equipmentList;
                        var temp = swig.renderFile('public/html/student.html', swigRespond);
                        res.end(temp);
                      });
                      
                    });
                });
            }
            else
            {
              swigRespond['my_dorm_capacity'] = null;
              swigRespond['roommates'] = null;
              var temp = swig.renderFile('public/html/student.html', swigRespond);
              res.end(temp);
            }
          });
      });
  });

app.get('/loadSuperadmin', function(req, res0)
  {
    var query_string0 = "select username from account where type = 'instructor'";
    var swigRespond = new Object();
    database.query(query_string0, function (err, res1)
    {
      var instructorList = new Array();
      for (var i = 0; i < res1.length; i++)
      {
        instructorList.push(res1[i].username);
      }
      swigRespond['instructor']=instructorList;

      query_string1 = "select username from account where type = 'admin'";
      database.query(query_string1, function (err, res2)
        {
          var administratorList = new Array();
          for (var i = 0; i < res2.length; i++)
          {
            administratorList.push(res2[i].username);
          }
          swigRespond['administrator']=administratorList;
          var temp = swig.renderFile('public/html/superadmin.html', swigRespond);
          res0.end(temp);
        });
      
    });
  });

app.get('/loadInstructor', function(req,res)
  {
    var swigRespond = new Object();
    swigRespond['my_username'] = req.cookies.username;
    var query_string = "select name, class from instructor where account_username = " + database.escape(req.cookies.username) + ";";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        swigRespond['my_name'] = res1[0].name;
        swigRespond['my_class'] = res1[0].class;
        query_string = "select account_username, name from student where class = " + database.escape(res1[0].class) + ";";
        database.query(query_string, function (err, res2)
        {
          if (err)
          {
            console.log(query_string);
            res.end();
          }
          var studentList = new Array();
          for (var i = 0; i < res2.length; i++)
          {
            var temp_obj = new Object();
            temp_obj['account'] = res2[i].account_username;
            temp_obj['name'] = res2[i].name;
            studentList.push(temp_obj);
          }
          swigRespond['students'] = studentList;
          swigRespond['my_stu_num'] = res2.length;
          query_string = "select a.id from applyment as a, student as s where a.state = 'recept' and a.student_account_username = s.account_username and s.class = " + database.escape(res1[0].class) + ";";
          database.query(query_string, function (err, res3)
            {
              var applymentList = new Array();
              for (var i = 0; i < res3.length; i++)
              {
                applymentList.push(res3[i].id.toString());
              }
              swigRespond['applyments'] = applymentList;
              query_string = "select d.id, d.student_account_username from discipline as d, student as s where d.student_account_username = s.account_username and s.class = " + database.escape(res1[0].class) + " ;";
              database.query(query_string, function (err, res4)
                {
                  var disciplineList = new Array();
                  for (var i = 0; i < res4.length; i++)
                  {
                    var disci = new Object();
                    disci['name'] = res4[i].student_account_username;
                    disci['id'] = res4[i].id.toString();
                    disciplineList.push(disci);
                  }
                  swigRespond['disciplines'] = disciplineList;
                  var temp = swig.renderFile('public/html/instructor.html', swigRespond);
                  res.end(temp);
                });
            });
        });
      });
  });

/* 处理post请求 */

app.post("/uploadXML", upload.single('avatar'), function (req, res)
  {
    console.log(avatar);
    res.end();
  });

app.post("/changeCapacity", urlencodedParser, function (req, res)
  {
    var query_string = "select * from student where dorm_building_num = " + parseInt(req.cookies.building_num) + " and dorm_room_num = " + req.body.room_num + ";";
    database.query(query_string, function (err, res2)
      {
        if (res2.length <= parseInt(req.body.capacity))
        {
          query_string = "update dorm set capacity = " + parseInt(req.body.capacity) + " where room_num = " + req.body.room_num + " and building_num = " + parseInt(req.cookies.building_num) + ";";
          database.query(query_string, function (err, res1)
            {
              if (err)
              {
                console.log(query_string);
              }
              res.end();
            });
        }
        else
        {
          res.end("failed");
        }
      });
  });

// 获取房间容量
app.post("/queryRoomCapacity", urlencodedParser, function (req, res)
  {
    var query_string = "select capacity from dorm where building_num = " + req.cookies.building_num + " and room_num = " + parseInt(req.body.room_num) + ";";
    database.query(query_string, function (err, res1)
      {
        res.end(res1[0].capacity.toString());
      });
  });

// 维修车成功
app.post('/fixSuccess', urlencodedParser, function (req, res)
  {
    var query_string = "update fix set state = 'success' where id = " + req.body.id +';';
    database.query(query_string, function (err, res1)
      {
        query_string = "update equipment set state = 'working' where id in (select equipment_id from fix where id = " + req.body.id + ");";
        database.query(query_string, function (err,res2)
          {
            if (err)
            {
              console.log(query_string);
            }
            res.end();
          });
      });
  });

// 维修失败
app.post('/fixFailed', urlencodedParser, function (req, res)
  {
    var query_string = "update fix set state = 'failed' where id = " + req.body.id +';';
    database.query(query_string, function (err, res1)
      {
        res.end();
      });
  });

// 查询维修申请
app.post('/queryFixInfo', urlencodedParser, function (req, res)
  {
    var query_string = "select f.date as date, e.id as id, e.name as name, e.dorm_room_num as room_num from equipment as e, fix as f where f.equipment_id = e.id and f.id = " + req.body.id + ";";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
        }
        res.end(JSON.stringify(res1));
      });
  });

// 提交一个维修申请
app.post('/newFix', urlencodedParser, function (req, res)
  {
    var query_string = "select max(id) from fix;";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
        }
        else
        {
          var temp_id = 1;
          if (res1[0]['max(id)'] != null)
          {
            temp_id = res1[0]['max(id)'] + 1;
          }
          query_string = "insert into fix values (null, 'pending', " + req.body.id + ", " + database.escape(req.body.date) + ", " + temp_id + ");";
          database.query(query_string, function (err, res2)
            {
              if (err)
              {
                console.log(query_string);
              }
              else
              {
                query_string = "update equipment set state = 'fault' where id = " + req.body.id + ';';
                database.query(query_string, function (err, res3)
                {
                  if (err)
                  {
                    console.log(query_string);
                  }
                  res.end();
                });
              }
            });
        }
      });
    
  });

// 查询历史维修记录
app.post("/queryRepairHistory", urlencodedParser, function (req, res)
  {
    var query_string = "select * from fix where equipment_id = " + parseInt(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        var fixbag = new Array();
        for (var i = 0; i < res1.length; i++)
        {
          var temp = Object();
          temp['feedback'] = res1[i].feedback;
          temp['state'] = res1[i].state;
          temp['id'] = res1[i].id;
          temp['date'] = res1[i].date;
          temp['equipment_id'] = res1[i].equipment_id;
          fixbag.push(temp);
        }
        var template = "维修记录{% for f in fixbag %}<div style='background:#EBEBEB; border-radius:10px; width:80%; margin:20px'><p>维修单号：{{  f.id  }}</p><p>维修状态：{{  f.state  }}</p><p>维修日期：{{  f.date  }}</p><p>维修回执：{{  f.feedback  }}</p></div>{% endfor %}";
        var output = swig.render(template, {locals: {'fixbag': fixbag}});
        res.end(output);
      });
  });

// 接受宿舍申请
app.post('/receptApply', urlencodedParser, function (req, res)
  {
    var query_string = "update applyment set state = 'recept' where id = " + database.escape(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        res.end();
      });
  });

// 拒绝宿舍申请
app.post('/rejectApply', urlencodedParser, function (req, res)
  {
    var query_string = "update applyment set state = 'reject' where id = " + database.escape(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        res1.end();
      });
  });

// 确认宿舍申请
app.post('/confirmApply', urlencodedParser, function (req, res)
  {
    var query_string = "update applyment set state = 'confirm' where id = " + database.escape(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        query_string = "select type, destination, student_account_username from applyment where id = " + database.escape(req.body.id) + ";";
        database.query(query_string, function (err, res2)
          {
            if (res2[0].type == "abandon")
            {
              query_string = "update student set dorm_room_num = null, dorm_building_num = null where account_username = " + database.escape(res2[0].student_account_username) + ";";
              database.query(query_string, function (err, res3)
                {
                  if (err)
                  {
                    console.log(query_string);
                  }
                  res.end();
                });
            }
            else
            {
              query_string = "update student set dorm_room_num = null, dorm_building_num = " + res2[0].destination + " where account_username = " + database.escape(res2[0].student_account_username) + ";";
              database.query(query_string, function (err, res3)
                {
                  if (err)
                  {
                    console.log(query_string);
                  }
                  res.end();
                });
            }
          });
      });
  });

// 查询宿舍申请
app.post('/queryApplyById', urlencodedParser, function (req, res)
  {
    var query_string = "select a.type as type, a.destination as destination, s.name as name, s.dorm_building_num as building, s.dorm_room_num as room from student as s, applyment as a where s.account_username = a.student_account_username and a.id = " + database.escape(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          res.end(JSON.stringify(res1));
        }
      });
  });

// 查询学生违纪情况
app.post("/queryDiscipline", urlencodedParser, function (req, res)
  {
    var query_string = "select d.content as content, d.date as time, s.name as name, s.id as id from student as s, discipline as d where s.account_username = d.student_account_username and d.id = " + database.escape(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          res.end(JSON.stringify(res1));
        }
      });
  });

// 提交一个宿舍申请
app.post('/newApplyment', urlencodedParser, function (req, res)
  {
    var query_string = "select max(id) from applyment;";
    database.query(query_string, function (err, res1)
      {
        var temp_id = 1;
        if (res1[0]['max(id)'] != null)
        {
          temp_id = res1[0]['max(id)'] + 1;
        }
        query_string = "insert into applyment (type, destination, state, student_account_username, id) values (" + database.escape(req.body.type) + ", " + ((req.body.destination == 'NaN') ? 'null' : parseInt(req.body.destination)) + ", " + database.escape("pending") + ", " + database.escape(req.cookies.username) + ", " + temp_id + ");";
        database.query(query_string, function (err, res2)
          {
            if (err)
            {
              console.log(query_string);
            }
            res.end();
          });
      });
    
  });

// 开出一张罚单
app.post('/newDiscipline', urlencodedParser, function (req, res)
{
  var query_string = "select max(id) from discipline;";
  database.query(query_string, function (err, res1)
  {
    var temp_id = 1;
    if (res1[0]['max(id)'] != null)
    {
      temp_id = res1[0]['max(id)'] + 1;
    }
    query_string = "insert into discipline values (" + database.escape(req.body.content) + ", " + database.escape(req.body.username) + ", " + database.escape(req.body.date) + ", " + temp_id + ");";
    database.query(query_string, function (err, res2)
      {
        if (err)
        {
          console.log(query_string);
        }
        res.end();
      });
  });
});

// 分配学生宿舍
app.post('/distributeStudent', urlencodedParser, function (req, res)
  {
    var query_string = "select account_username from student where dorm_building_num = " + req.cookies.building_num + " and dorm_room_num = " + parseInt(req.body.room_num) + " and bed_num = " + parseInt(req.body.bed_num) + ";";
    database.query(query_string, function (err, res2)
      {
        if (res2.length == 0 || res2[0].account_username == req.body.username)
        {
          query_string = "update student set bed_num = " + parseInt(req.body.bed_num) + ", dorm_room_num = " + parseInt(req.body.room_num) + " where account_username = " + database.escape(req.body.username) + ";";
          database.query(query_string, function (err, res1)
          {
            if (err)
            {
              console.log(query_string);
            }
            res.end();
          });
        }
        else
        {
          res.end("failed");
        }
      });
  });

// 更新设备信息
app.post('/updateEquipmentInfo', urlencodedParser, function (req, res)
{
  var query_string = "update equipment set name = " + database.escape(req.body.equip_name) + ", time = " + database.escape(req.body.equip_time) + ", dorm_room_num = " + parseInt(req.body.equip_room_num) + " where id = " + parseInt(req.body.equip_id) + ";";
  database.query(query_string, function (err, res1)
    {
      if (err)
      {
        console.log(query_string);
      }
      res.end();
    });

});

// 删除一个设备
app.post('/removeEquipment', urlencodedParser, function (req, res)
  {
    var query_string = "delete from equipment where id = " + parseInt(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
        }
        res.end();
      });
  });

// 新建一个设备
app.post('/newEquipment', urlencodedParser, function (req, res)
  {
    var query_string = "select max(id) from equipment;";
    database.query(query_string, function (err, res1)
      {
        var temp_id = 1;
        if (res1[0]['max(id)'] != null)
        {
          temp_id = res1[0]['max(id)'] + 1;
        }
        query_string = "insert into equipment (id, name, time, state, dorm_room_num, dorm_building_num) values(" + database.escape(temp_id) + ", " + database.escape(req.body.equip_name) + ", " + database.escape(req.body.equip_time) + ", " + database.escape("working") + ", " + req.body.equip_room_num + ", " + req.cookies.building_num + ');';
        database.query(query_string, function (err, res2)
          {
            if (err)
            {
              console.log(query_string);
            }
            res.end();
          });
      });
  });

// 查询房间容量
app.post('/queryRoomCapacity', urlencodedParser, function (req, res)
{
  var query_string = "select capacity from dorm where room_num = " + parseInt(req.body.room_num) + " and building_num = " + parseInt(req.body.building_num) + ";";
  database.query(query_string, function (err, res1)
  {
    if (err)
    {
      console.log(query_string);
      res.end();
    }
    else
    {
      res.end(res1[0].capacity);
    }
  })
});

// 查询设备信息
app.post('/queryEquipmentInfo', urlencodedParser, function (req, res)
  {
    var query_string = "select * from equipment where id = " + parseInt(req.body.id) + ";";
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          res.end(JSON.stringify(res1));
        }
      });
  });

// 查询学生宿舍信息
app.post('/queryStudentDorm', urlencodedParser, function (req, res)
  {
    var query_string = "select dorm_building_num, dorm_room_num, name, bed_num from student where account_username = " + database.escape(req.body.username) +';';
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          res.end(JSON.stringify(res1));
        }
      });
  });

// 辅导员更新学生信息，学号不可重复
app.post('/updateStudentInfo', urlencodedParser, function (req, res)
  {
    database.query("select account_username from student where id = " + database.escape(req.body.id), function (err, res0)
    {
      if (res0.length == 0 || res0[0].account_username == req.body.username)
      {
        var query_string = "update student set name = " + database.escape(req.body.name) + ", id = " + database.escape(req.body.id) + ", class = " + database.escape(req.body.class) + ", college = " + database.escape(req.body.college) + ", dorm_building_num = " + ((req.body.building_num == 'NaN' ) ? 'null' : parseInt(req.body.building_num)) + " where account_username = " + database.escape(req.body.username);
        database.query(query_string, function (err, res1)
          {
            if (err)
            {
              console.log(query_string);
              res.end();
            }
            else
            {
              res.end('success');
            }
          });
      }
      else
      {
        res.end('idExisted');
      }
    });
  });

// 辅导员创建新学生帐号，判断学号是否重复，帐号名为学号，默认密码123
app.post('/newStudent', urlencodedParser, function (req, res)
  {
    database.query("select account_username from student where id = " + database.escape(req.body.id), function (err, res0)
    {
      if (res0.length == 0)
      {
        var query_string0 = "insert into account values (" + database.escape(req.body.username) + ", " + database.escape(req.body.password) + ", 'student' )";
        var query_string1 = "insert into student (name, class, college, id, account_username, dorm_building_num) values ( " + database.escape(req.body.name) + ", " + database.escape(req.body.class) + ", " + database.escape(req.body.college) + ", " + database.escape(req.body.id) + ", " + database.escape(req.body.username) + ", " + req.body.building_num + " )";
        database.query(query_string0, function (err, res1)
          {
            if (err)
            {
              console.log(query_string0);
              res.end();
            }
            database.query(query_string1, function (err, res2)
              {
                if (err)
                {
                  console.log(query_string1);
                  res.end();
                }
                else
                {
                  res.end('success');
                }
              });
          });
      }
      else
      {
        res.end("idExisted");
      }
    });
  });

// 辅导员查询学生信息
app.post('/queryStudentInfo', urlencodedParser, function (req, res)
  {
    var query_string = 'select name, class, college, id, dorm_building_num from student where account_username = ' + database.escape(req.body.username) +' ;'
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          res.end(JSON.stringify(res1));
        }
      });
  });

// 超级管理员修改宿管信息
app.post('/changeAdmin', urlencodedParser, function (req, res)
  {
    var query_string = 'update admin set name = ' + database.escape(req.body.name) + ', building_num = ' + database.escape(req.body.building_num) + ' where account_username = ' + database.escape(req.body.username) +';'
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          query_string = "update dorm set admin_account_username = " + database.escape(req.body.username) + " where building_num = " + database.escape(req.body.building_num) +";";
          database.query(query_string, function (err, res2)
            {
              if (err)
              {
                console.log(query_string);
                res.end();
              }
              else
              {
                res.end('success');
              }
            });
          
        }
      });
  });

// 超级管理员修改辅导员信息
app.post('/changeInstr', urlencodedParser, function (req, res)
  {
    var query_string = 'update instructor set name = ' + database.escape(req.body.name) + ', class = ' + database.escape(req.body.class) + ' where account_username = ' + database.escape(req.body.username) +';'
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          res.end('success');
        }
      });
  });

// 超级管理员查询宿管信息
app.post('/queryNameAndBuilding', urlencodedParser, function (req, res)
  {
    var query_string = 'select name, building_num from admin where account_username = ' + database.escape(req.body.username) + ';';
    var answer = new Object();
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          answer['name'] = res1.name;
          answer['building_num'] = res1.building_num;
          res.end(JSON.stringify(res1));
        }
      });
    
  });

// 超级管理员查询辅导员信息
app.post('/queryNameAndClass', urlencodedParser, function (req, res)
  {
    var query_string = 'select name, class from instructor where account_username = ' + database.escape(req.body.username) + ';';
    var answer = new Object();
    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          answer['name'] = res1.name;
          answer['class'] = res1.class;
          res.end(JSON.stringify(res1));
        }
      });
    
  });

// 检测用户名是否存在
app.post('/regUsernameCheck', urlencodedParser, function (req, res0)
{
  var query_string = 'select username from account where username=' + database.escape(req.body.username) + ';';
  database.query(query_string, function (err, res1)
    {
      if (err)
      {
        console.log(query_string);
        res0.end();
      }
      if (res1.length == 0)
      {
        res0.end('null');
      }
      else
      {
        res0.end('exist');
      }
    });
});

// 注册账户，并生成对应的弱实体
app.post('/regAccount', urlencodedParser, function (req, res)
  {
    var query_string = "insert into account VALUES (" + database.escape(req.body.username) + ' , ' + database.escape(req.body.password) + ' , ' + database.escape(req.body.account_type) + ' );';
    var query_attatch;
    if (req.body.account_type == 'instructor')
    { 
      query_attatch = "insert into instructor VALUES ( 'NONAME', 'NOCLASS', " + database.escape(req.body.username) + ');';
    }
    else
    {
      query_attatch = "insert into admin VALUES ( 'NONAME', " + database.escape(req.body.username) + ", 0);";
    }

    database.query(query_string, function (err, res1)
      {
        if (err)
        {
          console.log(query_string);
          res.end();
        }
        else
        {
          database.query(query_attatch, function (err, res2)
          {
            if (err)
            {
              console.log(query_attatch);
              res.end();
            }
            res.end();
          });
        }
      });
  });

// 登陆
app.post('/login', urlencodedParser, function (req, res0)
  {
    var query_string = 'select type from account where username = ' + database.escape(req.body.username) + ' and password = ' + database.escape(req.body.password) + ';';
    database.query(query_string, function (err, res1)
    {
      if (err)
      {
        console.log(query_string);
        res0.end();
      }
      else
      {
        if (res1.length == 0)
        {
          var response = {
            state : 'failed',
            type : 'null'
          };
          res0.end(JSON.stringify(response));
        }
        else
        {
          var response = {
            state : 'success',
            type : res1[0].type
          }
          res0.end(JSON.stringify(response));
        }
      }
    });
  });

// 修改密码
app.post('/changePwd', urlencodedParser, function (req,res)
  {
    var query_string = "update account set password = " + database.escape(req.body.pwd) + "where username = " + database.escape(req.cookies.username) +";";
    database.query(query_string, function (err, res1)
      {
        res.end();
      });
  });

/* 端口监听 */
var server = app.listen(4581, function () 
{

  var host = server.address().address;
  var port = server.address().port;

  console.log("应用实例，访问地址为 http://%s:%s", host, port);

});