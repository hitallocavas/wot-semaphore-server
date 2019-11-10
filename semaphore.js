const express   = require('express')
const path      = require('path')
const WebSocket = require('ws')
const mqtt      = require('mqtt')
var bodyParser  = require('body-parser')
var sleep       = require('system-sleep')

const app       = express()
const client    = mqtt.connect('mqtt://broker.mqttdashboard.com') 
const wss       = new WebSocket.Server({ port: 8888 })

class Semaphore {
  constructor(name){
    this.name = name;
    this.ledResource = `wot-semaphore/${name}/led`;
    this.sonarResource = `wot-semaphore/${name}/sonar`;
  }
}

const semaphores = [
  new Semaphore('fst'),
  new Semaphore('snd')
]

// Logic
function semaphoreBehavior(ws) {
  while(true){
    client.publish('wot-semaphore/snd/led', 'G')
    ws.send({"color": "G"})
    sleep(3000);
    client.publish('wot-semaphore/snd/led', 'Y')
    ws.send({"color": "Y"})    
    sleep(1000);
    client.publish('wot-semaphore/snd/led', 'R')
    ws.send({"color": "G"})
    sleep(3000);
  }
}

// Comunication
client.on('connect', function(topic,message){
  console.log('MQTT connected');
  semaphores.forEach(s => client.subscribe(s.sonarResource))
})

wss.on('connection', function(ws) {
    console.log('WS connected')
    semaphoreBehavior(ws)
    client.on('message', function (topic, message) {
      const msg = JSON.stringify({"topic": topic, "message": String(message)});
      console.log(msg)
      ws.send(msg)
    })
})

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post('/fst', function (req, res) {
  var color = req.body.color;
  console.log(color);
  client.publish(semaphores[0], color)
  res.sendStatus(200);
});

app.post('/snd', function (req, res) {
  var color = req.body.color
  console.log(color);
  client.publish(semaphores[1], color)
  res.sendStatus(200);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}`))

