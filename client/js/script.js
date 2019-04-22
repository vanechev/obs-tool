
var nparticipants = 2;
var containers = [];
var data = [json1,json2];
var t1 = '2017-11-20 0:03:20';
var t2 = '2017-11-20 0:09:30';

wrapper = document.getElementById('timelines');

//Create divs where timelines will be attached
for(var i=1;i<=nparticipants;i++){
  container = document.createElement('div');
  container.setAttribute("id", "visualization"+i);
  wrapper.appendChild(container);

}

// Get DOM elements where the Timeline will be attached
for(var i=0;i<nparticipants;i++){
  containers[i] = document.getElementById('visualization'+(i+1));
}
console.log(containers);

var groups = [];
for(var i=0;i<nparticipants;i++){
  groups[i] = new vis.DataSet([
    {id:(i+1), content:"RN "+(i+1), classname:"rn"+(i+1)}]);
}
console.log(groups);

var items = [];
for(var i=0;i<nparticipants;i++){
  items[i] = new vis.DataSet(data[i]);
}
console.log(items);

// Configuration for the Timeline
  var options = {
    start: '2017-11-20 0:00:00',
    end: '2017-11-20 0:15:00',
    //timeAxis: {scale: 'seconds', step: 30},
    //groupOrder: 'content',  // groupOrder can be a property name or a sorting function
    zoomable: false,
    showMajorLabels: false,
    //showMinorLabels: false,
    tooltip: {
    overflowMethod: 'cap'
    }
  };

//Create timelines
for(var i=0;i<nparticipants;i++){
  var timeline = new vis.Timeline(containers[i]);
  timeline.setOptions(options);
  timeline.setGroups(groups[i]);
  timeline.setItems(items[i]);
  timeline.addCustomTime(t1, 't1');
  timeline.addCustomTime(t2, 't2');
  timeline.fit();
}


  var timeAxisElements = document.getElementsByClassName("vis-text vis-minor");
  //console.log(timeAxisElements);
  for (var i = 0; i < timeAxisElements.length; i++) {
    //if(timeAxisElements[i].textContent != "00:00" && timeAxisElements[i].textContent != "00:14" ){
      timeAxisElements[i].style.color = "white";
    //}
  }
