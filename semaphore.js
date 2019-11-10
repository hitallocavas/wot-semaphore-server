const express = require('express')
const path = require('path')
const app = express()
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://broker.mqttdashboard.com')


  app.post('/fst', function (req, res) {
    client.subscribe('wot-semaphore/fst/led', function (err) {
      client.publish('wot-semaphore/fst/led', req.color)
    })
    res.sendStatus(200);
  });

  
  app.post('/snd', function (req, res) {
    client.subscribe('wot-semaphore/snd/led', function (err) {
      client.publish('wot-semaphore/snd/led', req.color)
    })
    res.sendStatus(200);
  });


  client.on('message', function (topic, message) {
    console.log(topic.toString() + ": " + message.toString())
  })

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}`))

