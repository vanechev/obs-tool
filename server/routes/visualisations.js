const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'group_analyticsV2'
});


//insert source in session
router.post('/getDataforVis', (req, res, next) => {
  var results = [];
  const id_session = req.body.id_session;
  
  con.connect(function(err){});
  // Get mysql client from the connection pool
  var query_string = 'SELECT session.name as session_name, action_session_object.id_session, objects.name as object_type, actions.action_type, action_session_object.id, action_session_object.action_desc, action_session_object.notes, action_session_object.id_object, action_session_object.time_action, action_session_object.duration, object_session.name FROM action_session_object LEFT JOIN object_session ON action_session_object.id_object=object_session.id AND action_session_object.id_session=object_session.id_session JOIN actions ON action_session_object.id_action = actions.id LEFT JOIN objects ON object_session.id_object = objects.id JOIN session ON action_session_object.id_session = session.id WHERE action_session_object.id_session = ? AND actions.action_type NOT IN ("arousal") ORDER BY action_session_object.id ASC;';
  con.query(query_string, [req.body.id_session], (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });
    //console.log(results);
    return res.json(results);
  });
  
    //return res.json(JSON.parse(results));
});

//save arousal states into session
router.post('/saveArousalState', (req, res, next) => {
  var results = [];
  console.log(req.body.id_session);  
  var q_string = {id_session: req.body.id_session, id_action:43, id_object:req.body.person, action_desc:'Arousal state', time_action:req.body.arousal_time};
  //}
  
  con.query('INSERT INTO action_session_object SET ?', q_string, (err, result) => {
  if(err) throw err;
    console.log(`Inserted ${result.affectedRows} row(s)`);
    return res.json(1);
  });//end query

});

//insert source in session
router.post('/getArousalData', (req, res, next) => {
  var results = [];
  const id_session = req.body.id_session;
  
  con.connect(function(err){});
  // Get mysql client from the connection pool
  var query_string = 'SELECT session.name as session_name, action_session_object.id_session, objects.name as object_type, actions.action_type, action_session_object.id, action_session_object.action_desc, action_session_object.notes, action_session_object.id_object, action_session_object.time_action, action_session_object.duration, object_session.name FROM action_session_object LEFT JOIN object_session ON action_session_object.id_object=object_session.id AND action_session_object.id_session=object_session.id_session JOIN actions ON action_session_object.id_action = actions.id LEFT JOIN objects ON object_session.id_object = objects.id JOIN session ON action_session_object.id_session = session.id WHERE action_session_object.id_session = ? ORDER BY action_session_object.id ASC;';
  con.query(query_string, [req.body.id_session], (err, rows) => {
  if(err) throw err;

  rows.forEach( (row) => {
    results.push(row);
    //console.log(`${row.id_session} , ${row.id_datatype}`);
    });
    //console.log(results);
    return res.json(results);
  });
  
    //return res.json(JSON.parse(results));
});

//added 30-04-2019
router.post('/generateJson2', (req, res, next) => {
  dataActions = req.body;
  //console.log(dataActions);

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  newdate = year + "-" + month + "-" + day;
  var alldata = {};
  var participants = {};
  var nparticipants = 0;
  var CPR_array = [];
  var sessions_stop = [];
  var id_session = 0;
  

  for (var i = 0; i < dataActions.length; i++) {
          if (dataActions[i].name != null){
            participants[dataActions[i].name] = [];
          }
        }
  console.log(participants);
  for (x in participants) {nparticipants++;}

alldata["n"] = nparticipants;
alldata["title"] = dataActions[0].session_name;
//participants["time_start"] = newdate+" 00:00:00";
alldata["criticalTs"] = [];

        for (var i = 0; i < dataActions.length; i++) {
          //id_session to generate json file
          id_session = dataActions[i].id_session;

          //add when the session started
          if(dataActions[i].action_desc == "Session started"){
            alldata["time_start"] = dataActions[i].time_action;
          }
          //add when the session ended
          if(dataActions[i].action_desc == "Session ended"){
            alldata["time_end"] = dataActions[i].time_action;
          }
          

          //add actions that were done by a student
          if(dataActions[i].duration != null && dataActions[i].name != null ){
            var item = {};
                    console.log("aqui "+item)
            //find CPR actions as they have duration
            if(dataActions[i].action_desc == "Start CPR"){
              CPR_array.push(dataActions[i]);
            }

            else if(dataActions[i].action_desc == "Stop CPR"){
              sessions_stop.push(dataActions[i].id);
            }

            else {
                   //add critical items to R1 - they don't have student associated
                    if(dataActions[i].action_type == "critical" && dataActions[i].name == "PTN"){
                      var ct = {};
                      ct["event"] = dataActions[i].action_desc;
                      ct["when"] = dataActions[i].time_action;
                      alldata["criticalTs"].push(ct);

                      var critical_item = {};
                      //time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
                      critical_item["id"] = participants["PTN"].length+1;
                      critical_item["group"] = dataActions[i].id_object;
                      critical_item["action"] = dataActions[i].action_desc;
                      critical_item["start"] = dataActions[i].time_action;
                      critical_item["type"] = "box";
                      critical_item["className"] = "critical";
                     
                      //if(data[i].action_desc.split(" ")[0] == "Ask"){
                        critical_item["content"] = '<img src="../../../img/warning.png" style="width: 40px; height: 40px;"><div class="special-time">'+moment(dataActions[i].duration,"hh:mm:ss.SSS").format("HH:mm:ss")+'</div><div id="text">'+dataActions[i].action_desc+'</div>';
                      //  }
                      //else if(data[i].action_desc.split(" ")[0] == "Lose"){
                      //  critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/lose.png" style="width: 136px; height: 112px;">';
                      //  }
                      participants["PTN"].push(critical_item);
                    }

             else {
                  //console.log(data[i].action_desc);
                  //any other action

                  //time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
                  item["id"] = participants[dataActions[i].name].length+1;
                  item["group"] = dataActions[i].id_object;
                  item["action"] = dataActions[i].action_desc;
                  item["start"] = dataActions[i].time_action;
                  item["title"] = dataActions[i].notes;
                  item["type"] = "box";
                  if (dataActions[i].action_desc == "Deliver Shock"){
                    item["className"] = "action shock "+dataActions[i].object_type.toLowerCase();
                  }
                  else{
                    item["className"] = "action "+dataActions[i].object_type.toLowerCase();
                  }
                  
                  item["content"] = moment(dataActions[i].duration,"hh:mm:ss.SSS").format("HH:mm:ss")+'<div id="text">'+dataActions[i].action_desc+'</div>';
                  if (dataActions[i].name != null){
                    //console.log("aqui "+item)
                    participants[dataActions[i].name].push(item);
                    //console.log("aqui "+participants)
                  }
              }
            }
          }

        }//end for
        //console.log(sessions_stop);
        // add info from CPR
        for (var i = 0; i < CPR_array.length; i++) {
          var id_reg = CPR_array[i].id;
          var item = {};
            //time_from_start = CPR_array[i].duration.split(":").slice(-2).join(":").split(".")[0];
            item["id"] = participants[CPR_array[i].name].length+1;
            item["group"] = CPR_array[i].id_object;
            item["start"] = CPR_array[i].time_action;
            item["align"] = "center";
            item["className"] = 'cpr';
            
            item["content"] = moment(CPR_array[i].duration,"hh:mm:ss.SSS").format("HH:mm:ss")+'<div id="text">Compressions</div>';
            var nearCPR = closest(id_reg,sessions_stop);
            sessions_stop = remove_closest(nearCPR,sessions_stop);
            
            for(var j=0; j < dataActions.length; j++){
              if(dataActions[j].action_desc == "Stop CPR" && dataActions[j].id == nearCPR){
                  item["end"] = dataActions[j].time_action;
                  item["title"] = diff_minutes(dataActions[j].duration,CPR_array[i].duration)+" mins";
              }
            }
          participants[CPR_array[i].name].push(item);
          alldata['participants'] = participants;
          
        }
        alldata['participants'] = participants;
        console.log(alldata);

  fs.writeFile("client/data/session_"+id_session+".json", JSON.stringify(alldata), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  }); 

  //console.log(participants);
  return res.json(alldata);
});


//added 25-05-2019
router.post('/generateJsonArousalData', (req, res, next) => {
  dataActions = req.body;
  //console.log(dataActions);
  var alldata = {};
  var participants = {};
  var nparticipants = 0;
  var CPR_array = [];
  var sessions_stop = [];
  var id_session = 0;
  

  for (var i = 0; i < dataActions.length; i++) {
          if (dataActions[i].name != null){
            participants[dataActions[i].name] = [];
          }
        }
  //console.log(participants);
  for (x in participants) {nparticipants++;}

alldata["n"] = nparticipants;
alldata["title"] = dataActions[0].session_name;
//participants["time_start"] = newdate+" 00:00:00";
alldata["criticalTs"] = [];

        for (var i = 0; i < dataActions.length; i++) {
          //id_session to generate json file
          id_session = dataActions[i].id_session;

          //add when the session started
          if(dataActions[i].action_desc == "Session started"){
            alldata["time_start"] = dataActions[i].time_action;
          }
          //add when the session ended
          if(dataActions[i].action_desc == "Session ended"){
            alldata["time_end"] = dataActions[i].time_action;
          }
          

          //add actions that were done by a student
          if(dataActions[i].duration != null && dataActions[i].name != null ){
            var item = {};

                   //add critical items to R1 - they don't have student associated
                    if(dataActions[i].action_type == "critical" && dataActions[i].name == "PTN"){
                      var ct = {};
                      ct["event"] = dataActions[i].action_desc;
                      ct["when"] = dataActions[i].time_action;
                      alldata["criticalTs"].push(ct);

                      var critical_item = {};
                      //time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
                      critical_item["id"] = participants["PTN"].length+1;
                      critical_item["group"] = dataActions[i].id_object;
                      critical_item["action"] = dataActions[i].action_desc;
                      critical_item["start"] = dataActions[i].time_action;
                      critical_item["type"] = "box";
                      critical_item["className"] = "critical";
                     
                      //if(data[i].action_desc.split(" ")[0] == "Ask"){
                        critical_item["content"] = '<img src="../../../img/warning.png" style="width: 40px; height: 40px;"><div class="special-time">'+moment(dataActions[i].duration,"hh:mm:ss.SSS").format("HH:mm:ss")+'</div><div id="text">'+dataActions[i].action_desc+'</div>';
                      //  }
                      //else if(data[i].action_desc.split(" ")[0] == "Lose"){
                      //  critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/lose.png" style="width: 136px; height: 112px;">';
                      //  }
                      participants["PTN"].push(critical_item);
                    }

                  else if(dataActions[i].action_type == "arousal"){
                  //console.log(data[i].action_desc);
                  //any other action

                  //time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
                  item["id"] = participants[dataActions[i].name].length+1;
                  item["group"] = dataActions[i].id_object;
                  //item["action"] = dataActions[i].action_desc;
                  item["start"] = dataActions[i].time_action;
                  //item["title"] = dataActions[i].notes;
                  item["type"] = "box";
                  item["className"] = "arousal";
                  //item["content"] = moment(dataActions[i].duration,"hh:mm:ss.SSS").format("mm:ss")+'<div id="text">'+dataActions[i].action_desc+'</div>';
                  participants[dataActions[i].name].push(item);
                  }

                  else{
                  //console.log(data[i].action_desc);
                  //any other action

                  //time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
                  item["id"] = participants[dataActions[i].name].length+1;
                  item["group"] = dataActions[i].id_object;
                  item["action"] = dataActions[i].action_desc;
                  item["start"] = dataActions[i].time_action;
                  item["title"] = dataActions[i].notes;
                  item["type"] = "box";
                  //item["className"] = "hide";
                  item["className"] = "action "+dataActions[i].object_type.toLowerCase();
                  item["content"] = moment(dataActions[i].duration,"hh:mm:ss.SSS").format("HH:mm:ss")+'<div id="text">'+dataActions[i].action_desc+'</div>';
                  if (dataActions[i].name != null){
                    //console.log("aqui "+item)
                    participants[dataActions[i].name].push(item);
                    //console.log("aqui "+participants)
                  }
                  }
            
          }

        }//end for
      
      part_names = Object.keys(participants);
        
      alldata['participants'] = participants;
        //console.log(alldata);

  fs.writeFile("client/data/arousal_session_"+id_session+".json", JSON.stringify(alldata), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  }); 

  //console.log(participants);
  return res.json(alldata);
});//generate Json Arousal Data

router.post('/generateJson', (req, res, next) => {
  data = req.body;
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  newdate = year + "-" + month + "-" + day;

  var participants = {};
  var nparticipants = 0;
  var CPR_array = [];
  var sessions_stop = [];
  var id_session = 0;
  for (var i = 0; i < data.length; i++) {
          if (data[i].name != null){
            participants[data[i].name] = [];
          }
        }
  for (x in participants) {nparticipants++;}
participants["n"] = nparticipants;
participants["time_start"] = newdate+" 00:00:00";
participants["criticalTs"] = [];

        for (var i = 0; i < data.length; i++) {
          //id_session to generate json file
          id_session = data[i].id_session;
          //add when the session ended
          if(data[i].action_desc == "Session ended"){
            participants["time_end"] = newdate+" "+data[i].duration.split(".")[0];
          }
          
          //add critical items to R1 - they don't have student associated
          if(data[i].param_value == "alert"){
            var ct = {};
            ct["event"] = data[i].action_desc;
            ct["when"] = newdate+" "+data[i].duration.split(".")[0];
            participants["criticalTs"].push(ct);

            var critical_item = {};
            time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
            critical_item["id"] = participants["RN1"].length+1;
            critical_item["group"] = 1;
            critical_item["action"] = data[i].action_desc;
            critical_item["start"] = newdate+" "+data[i].duration.split(".")[0];
            critical_item["type"] = "box";
            critical_item["className"] = "critical";
           
            if(data[i].action_desc.split(" ")[0] == "Ask"){
              critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/ask.png" style="width: 136px; height: 112px;">';
              }
            else if(data[i].action_desc.split(" ")[0] == "Lose"){
              critical_item["content"] = '<div class="special-time">'+time_from_start+'</div><img src="../../../img/lose.png" style="width: 136px; height: 112px;">';
              }
            participants["RN1"].push(critical_item);
          }

          //add actions that were done by a student
          if(data[i].duration != null && data[i].name != null ){
            var item = {};
            //find CPR actions as they have duration
            if(data[i].action_desc == "Start CPR"){
              CPR_array.push(data[i]);
            }

            else if(data[i].action_desc == "Stop CPR"){
              sessions_stop.push(data[i].id);
            }

            else {
              //console.log(data[i].action_desc);
              //any other action
              time_from_start = data[i].duration.split(":").slice(-2).join(":").split(".")[0];
              item["id"] = participants[data[i].name].length+1;
              item["group"] = parseInt(data[i].name.slice(-1));
              item["action"] = data[i].action_desc;
              item["start"] = newdate+" "+data[i].duration.split(".")[0];
              item["type"] = "box";
              if (data[i].action_desc == "Deliver Shock"){
                item["className"] = "action shock "+data[i].name.toLowerCase();
              }
              else{
                item["className"] = "action "+data[i].name.toLowerCase();
              }
              
              item["content"] = time_from_start+'<div id="text">'+data[i].action_desc+'</div>';
              if (data[i].name != null){
                participants[data[i].name].push(item);
              }
            }
          }

        }//end for
        //console.log(sessions_stop);
        // add info from CPR
        for (var i = 0; i < CPR_array.length; i++) {
          var id_reg = CPR_array[i].id;
          var item = {};
            time_from_start = CPR_array[i].duration.split(":").slice(-2).join(":").split(".")[0];
            item["id"] = participants[CPR_array[i].name].length+1;
            item["group"] = parseInt(CPR_array[i].name.slice(-1));
            item["start"] = newdate+" "+CPR_array[i].duration.split(".")[0];
            item["align"] = "center";
            item["className"] = 'cpr';
            
            item["content"] = time_from_start+'<div id="text">Compressions</div>';
            var nearCPR = closest(id_reg,sessions_stop);
            sessions_stop = remove_closest(nearCPR,sessions_stop);
            
            for(var j=0; j < data.length; j++){
              if(data[j].action_desc == "Stop CPR" && data[j].id == nearCPR){
                  item["end"] = newdate+" "+data[j].duration.split(".")[0];
                  item["title"] = diff_minutes(data[j].duration,CPR_array[i].duration)+" mins";
              }
            }
          participants[CPR_array[i].name].push(item);
          //console.log(item);
        }

  fs.writeFile("client/data/session_"+id_session+".json", JSON.stringify(participants), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  }); 

  //console.log(participants);
  return res.json(participants);
});

router.get('/getJsonFromFile', (req, res, next) => {
  const id_session = req.query.id;
  var obj = JSON.parse(fs.readFileSync('client/data/session_'+id_session+'.json', 'utf8'));

  return res.json(obj);
  
    //return res.json(JSON.parse(results));
});

router.get('/getJsonArousalDataFromFile', (req, res, next) => {
  const id_session = req.query.id;
  var obj = JSON.parse(fs.readFileSync('client/data/arousal_session_'+id_session+'.json', 'utf8'));

  return res.json(obj);
  
    //return res.json(JSON.parse(results));
});

function closest (num, arr) {
                var curr = arr[0];
                var diff = Math.abs (num - curr);
                for (var val = 0; val < arr.length; val++) {
                    var newdiff = Math.abs (num - arr[val]);
                    if (newdiff < diff) {
                        diff = newdiff;
                        curr = arr[val];
                    }
                }
                return curr;
            }

function remove_closest (num, arr) {
                //console.log(arr1);
                for (var val = 0; val < arr.length; val++) {
                    if (arr[val] == num) {
                        removed =  arr.splice(val, 1);
                    }
                }
                return arr;
            }            
function diff_minutes(dt2, dt1) 
 {
  console.log(newdate+" "+dt1);
  var t1 = new Date(newdate+" "+dt1);
  var t2 = new Date(newdate+" "+dt2);
  var diff =t2.getTime() - t1.getTime();
  minutes = Math.floor(diff % 3.6e5) / 6e4;
  console.log(minutes.toFixed(2));
  return minutes.toFixed(2);
  
 }
module.exports = router;