"use strict";

const NodeWebcam = require("node-webcam");
const fs = require("fs");
const path = require("path");
const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadFileToBlockBlob
} = require('@azure/storage-blob');

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
};

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

const ONE_MINUTE = 60 * 1000;


// Create path for image storage
function createPath() {
  fs.mkdir('images', {}, (err)=>{
    if (err) console.log(error);
  });
}

// Configure Blob Storage for uploading
function configureBlobStorage(containerName, containerURL, aborter) {

  // Creates container
  await containerURL.create(aborter);
  console.log(`Container: "${containerName}" is created`);

}

// Takes image from usb camera and saves it to local file
// Returns relative path to file
function takePicture() {
  const Webcam = NodeWebcam.create(opts);
  Webcam.capture(`images/camera_img`, function(err, data) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      console.log(`Image saved in ${data}`);
      return data;
    }
  });
}

// Analyzes photo and returns states
function analyzeImage(img_path){
  return {};
}

// Uploads image to blob storage
function uploadImage(img_path, containerName, containerURL, aborter, url){
  
  img_path = path.resolve(img_path);
  const imgName = path.basename(filePath);
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, imgName);

  uploadFileToBlockBlob(aborter, filePath, blockBlobURL);

  const uploadPath = `${url}/${containerName}`;

  console.log(`Local file "${imgName}" is uploaded to ${uploadPath}`);

  return uploadPath;
}

// Driver
async function execute(){
  const containerName = 'pi_image_upload';
  const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
  const pipeline = StorageURL.newPipeline(credentials);
  const url = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
  const serviceURL = new ServiceURL(url, pipeline);   
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
  const aborter = Aborter.timeout(ONE_MINUTE);


  // Create container
  configureBlobStorage(containerName, containerURL, aborter);

  // Create images directory to store pi images
  createPath();

  // Use node_webcam module to take and analyze pictures
  var img_path = takePicture();

  // Analyzes the photo and returns any states
  const states =  analyzeImage(img_path);

  // upload images to blob storage
  const uploadPath = uploadImage(img_path, containerName, containerURL, aborter, url);

  return JSON.stringify({
    "img_url": uploadPath,
    "states": states
  })
}

// execute().catch(err => console.log(err));
