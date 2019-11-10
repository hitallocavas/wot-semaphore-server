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
  constructor(name, carCrossing){
    this.name = name;
    this.ledResource = `wot-semaphore/${name}/led`;
    this.sonarResource = `wot-semaphore/${name}/sonar`;
    this.carCrossing = false;
    this.carQtt = 0
  }
}

const semaphores = [
  new Semaphore('fst'),
  new Semaphore('snd')
]

function handleMessage(topic, message, ws) {
  console.log(message)
  const distance = Number.parseFloat(message)
  const semaphore = semaphores.find(s => s.sonarResource == topic)

  if(!semaphore.carCrossing && distance < 10) {
    semaphore.carCrossing = true;
    semaphore.carQtt++
    ws.send(`{"semaphore": "${semaphore.name}", "carQtt":${semaphore.carQtt}}`)
  } else if(semaphore.carCrossing && distance >= 10) {
    semaphore.carCrossing = false;
  }

  // console.log(semaphore.carQtt)
}

// Comunication
client.on('connect', function(topic,message){
  console.log('MQTT connected');
  semaphores.forEach(s => client.subscribe(s.sonarResource))
})
 

wss.on('connection', function(ws) {
    console.log('WS connected')
    
    for (const s of semaphores)
      setInterval(() => {
        client.publish(s.ledResource, 'G')
        ws.send(`{"semaphore":"${s.name}","color":"G"}`)
        sleep(3000);
        client.publish(s.ledResource, 'Y')
        ws.send(`{"semaphore":"${s.name}","color":"Y"}`)
        sleep(1000);
        client.publish(s.ledResource, 'R')
        ws.send(`{"semaphore":"${s.name}","color":"R"}`)
        // sleep(3000);
      }, 0);

    client.on('message', function (topic, message) {
      
      // console.log(message.toString())
      handleMessage(topic, message.toString(), ws)
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

