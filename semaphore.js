// Config
const express = require('express')
const path = require('path')
const app = express()
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://broker.mqttdashboard.com')
const WebSocket = require('ws') 
const wss = new WebSocket.Server({ port: 8888 })
var bodyParser = require('body-parser')
var sleep = require('system-sleep')

// Logic
function semaphoreBehavior() {
  while(true){
    client.publish('wot-semaphore/snd/led', 'G')
    sleep(3000);
    client.publish('wot-semaphore/snd/led', 'Y')
    sleep(1000);
    client.publish('wot-semaphore/snd/led', 'R')
    sleep(3000);
  }
}

function bin2string(array){
	var result = "";
	for(var i = 0; i < array.length; ++i){
		result+= (String.fromCharCode(array[i]));
	}
	return result;
}

// Comunication
client.on('connect', function(topic,message){
  console.log('MQTT connected');
  client.subscribe('wot-semaphore/fst/sonar')
  client.subscribe('wot-semaphore/snd/sonar')
  semaphoreBehavior()
})

wss.on('connection', function(ws) {
    console.log('WS connected')  
    client.on('message', function (topic, message) {
      const obj = new Object()
      obj['topic'] = topic
      obj['message'] = bin2string(message)
      ws.send(JSON.stringify(obj))
    })
})

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post('/fst', function (req, res) {
  var color = req.body.color;
  console.log(color);
  client.publish('wot-semaphore/fst/led', color)
  res.sendStatus(200);
});

app.post('/snd', function (req, res) {
  var color = req.body.color
  console.log(color);
  client.publish('wot-semaphore/snd/led', color)
  res.sendStatus(200);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}`))

