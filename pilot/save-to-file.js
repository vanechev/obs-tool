var mqtt = require('mqtt')
var url = require('url')

var mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://wfejcfvu:t7Os7ERNBJ0s@m14.cloudmqtt.com:19641');
var auth = (mqtt_url.auth || ':').split(':');

var client  = mqtt.connect(mqtt_url, username='wfejcfvu', password='t7Os7ERNBJ0s')
var fs = require('fs');
var logger = fs.createWriteStream('log.txt', {
  flags: 'a' // 'a' means appending (old data will be preserved)
})


client.on('connect', function () {
  client.subscribe('tag')
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  logger.write(message+"\r\n")
})