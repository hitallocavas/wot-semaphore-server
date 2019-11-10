const express = require('express')
const path = require('path')
const app = express()
const mqtt = require('mqtt')
var bodyParser = require('body-parser')
var sleep = require('system-sleep');


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


const client  = mqtt.connect('mqtt://broker.mqttdashboard.com')


  app.post('/fst', function (req, res) {
    var color = req.body.color;
    client.subscribe('wot-semaphore/fst/led', function (err) {
      console.log(color);
      client.publish('wot-semaphore/fst/led', color)
    })
    res.sendStatus(200);
  });

  
  app.post('/snd', function (req, res) {
    var color = req.body.color;
    client.subscribe('wot-semaphore/snd/led', function (err) {
      console.log(color);
      client.publish('wot-semaphore/snd/led', color)
    })
    res.sendStatus(200);
  });

  client.on('message', function (topic, message) {
    console.log(topic.toString() + ": " + message)
  })

  client.on('connect', function(topic,message){
    while(true){
      client.publish('wot-semaphore/snd/led', 'R')
      sleep(3000);
      client.publish('wot-semaphore/snd/led', 'Y')
      sleep(2000);
      client.publish('wot-semaphore/snd/led', 'G')
      sleep(3000);
    }
  })
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}`))

