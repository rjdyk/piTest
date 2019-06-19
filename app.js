'use strict';

const Transport = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').ModuleClient;
const Message = require('azure-iot-device').Message;
const NodeWebcam = require( "node-webcam" );
const fs = require('fs');
const path = require('path');
const blob = require('blob');
const opts = {
    //Picture related
 
    width: 1280,
 
    height: 720,
 
    quality: 100,
 
 
    //Delay in seconds to take shot
    //if the platform supports miliseconds
    //use a float (0.1)
    //Currently only on windows
 
    delay: 0,
 
 
    //Save shots in memory
 
    saveShots: true,
 
 
    // [jpeg, png] support varies
    // Webcam.OutputTypes
 
    output: "jpeg",
 
 
    //Which camera to use
    //Use Webcam.list() for results
    //false for default device
 
    device: false,
 
 
    // [location, buffer, base64]
    // Webcam.CallbackReturnTypes
 
    callbackReturn: "location",
 
 
    //Logging
 
    verbose: fals
}

Client.fromEnvironment(Transport, function (err, client) {
  if (err) {
    throw err;
  } else {
    client.on('error', function (err) {
      throw err;
    });

    // connect to the Edge instance
    client.open(function (err) {
      if (err) {
        throw err;
      } else {
        console.log('IoT Hub module client initialized');

        // Act on input messages to the module.
        client.on('inputMessage', function (inputName, msg) {
          pipeMessage(client, inputName, msg);
          createPath();
          takePicture();
        });
      }
    });
  }
});

// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));

  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    if (message) {
      var outputMsg = new Message(message);
      client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
    }
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}

// Create path for image storage
function createPath(){
  fs.exists('images') ? null : fs.mkdirSync('images');
}

function configureBlobStorage(){

}

function takePicture(){
  const Webcam = NodeWebcam.create(opts);
  Webcam.capture(`images/img_${img_num}`, function (err,data){
    if (err){
      console.log(err);
      throw err;
    }else{
      console.log(`Image saved in ${data}`);
    }
  });
  
}