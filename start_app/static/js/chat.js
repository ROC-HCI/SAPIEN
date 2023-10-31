// Code authors: Masum Hasan, Cengiz Ozel, Sammy Potter
// ROC-HCI Lab, University of Rochester
// Copyright (c) 2023 University of Rochester

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
// THE SOFTWARE.


if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
  window.location.href = '/';
}


window.onload = function loadLight() {
  // check if a video with the id "remotePlayerFrame" exists. it has to be a video tag
  if (document.getElementById("light")) {
    var video = document.getElementById("remotePlayerFrame");
    if (video) {
      console.log("video exists");

      const mhName = sessionStorage.getItem('mhFNameCurrent');
      console.log(mhName);
      video.src = "static/video/Metahumans/"+mhName+".mp4";
      video.play();

      const headerContainer = document.getElementById('header-container');
      const videoElement = document.getElementById("cameraElement");
      const recordButton = document.getElementById('recordButton');
      const videoButton = document.getElementById('videoButton');
      const hangupButton = document.getElementById('hangupButton');
      const recordButtonHolder = document.querySelector('.recordButtonHolder');
      const pElement = recordButtonHolder.querySelector('p');

      headerContainer.style.visibility = 'visible';
      videoElement.style.visibility = 'visible';
      recordButton.style.visibility = 'visible';
      videoButton.style.visibility = 'visible';
      hangupButton.style.visibility = 'visible';
      pElement.style.visibility = 'visible';
    }
  }
};

const cameraElement = document.getElementById('cameraElement');
var cameraList = [];

navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    console.log('Devices:', devices);
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('Video Devices:', videoDevices);

    // add the video devices to the dropdown
    videoDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label;
      cameraList.push(option);
    });

    if (videoDevices.length === 0) {
      console.error('No video devices found.');
    } else if (videoDevices.length === 1) {
      startCamera(videoDevices[0].deviceId);
      loadOptions(0);
    } else {
      const cameraId = sessionStorage.getItem('cameraId');
      if (cameraId) {
        console.log('Camera ID from session:', cameraId);
        // get index by value
        const cameraIndex = cameraList.findIndex(option => option.value === cameraId);
        console.log('Camera index: ', cameraIndex);
        loadOptions(cameraIndex);

        startCamera(cameraId);
      } else {
        loadOptions()
        startCamera(videoDevices[0].deviceId);
      }
    }
  })
  .catch(error => {
    console.error('Error accessing video:', error);
  });


async function startCamera(cameraId) {
  try {
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } });

    // Set the source of the video element to the camera
    cameraElement.srcObject = cameraStream;

    console.log('Camera started:', cameraStream);
  } catch (error) {
    console.error('Error accessing video:', error);
  }
}

var cameraActive = true;
function toggleCamera() {
  const imageElement = document.getElementById('videoButton').getElementsByTagName('img')[0];
  if (!cameraActive) {
    cameraElement.style.visibility = 'visible'; // Show cameraElement
    imageElement.src = '/static/img/video.png';
    cameraActive = true;
  } else {
    cameraElement.style.visibility = 'hidden'; // Hide cameraElement
    imageElement.src = '/static/img/video_off.png';
    cameraActive = false;
  }
}



// Updates Flask session with the selected camera
function updateCamera(cameraId) {
  console.log("cameraId: " + cameraId);
  // const data = { 'cameraId': cameraId };
  sessionStorage.setItem('cameraId', cameraId);
}


// var tempSwapStore = 0;
// var tempNamesMH = ['Ada', 'Chandra', 'Cooper', 'Danielle', 'Dhruv', 'Erno', 'Farrukh', 'Glenda', 'Hadley', 'Hana', 'Hudson', 'Jesse', 'Keiji', 'Kendra', 'Koda', 'Lena', 'Maria', 'Myles', 'Nasim', 'Natalia', 'Orla', 'Oskar', 'Pia', 'Sadhil', 'Seneca', 'Sook-ja', 'Vincent', 'Vivian', 'Wallace', 'Zeva', 'Zhen']
// function tempSwitchMH(direction) {
//   tempSwapStore += direction;
//   if (tempSwapStore < 0) {
//     tempSwapStore = tempNamesMH.length - 1;
//   }
//   if (tempSwapStore >= tempNamesMH.length) {
//     tempSwapStore = 0;
//   }
//   console.log("Debug switched to MH: " + tempNamesMH[tempSwapStore]);
//   sendDataMessage("MH", tempNamesMH[tempSwapStore]);
// }


// document.addEventListener('keydown', event => {
//   const iframe = document.getElementById('remotePlayerFrame');
//   switch (event.key) {
//     case 'f':
//       console.log("entering fullscreen");
//       if (!document.fullscreenElement) {
//         iframe.requestFullscreen();
//       } else {
//         document.exitFullscreen();
//       }
//       break;
//     case 'ArrowRight':
//       tempSwitchMH(1);
//       break;
//     case 'ArrowLeft':
//       tempSwitchMH(-1);
//       break;
//   }
// });

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const remotePlayerFrame = document.getElementById('remotePlayerFrame');
var callStarted = false;

var got_ip = false;
var ipAddress = '';

let checkReady = setTimeout(() => {
  window.location.href = "/";
}, 300000);

window.addEventListener('message', async event => {

  if (!got_ip) {
    try {
      const response = await fetch('/get_mode');
      const localMode = await response.json();

      ipAddress = document.getElementById("chatJS").getAttribute("iframe_url");

      console.log("localMode.local: " + localMode.local);
    } catch (error) {
      console.error('Error:', error);
    }
    got_ip = true;
  }

  console.log("!!!got message from " + event.origin + " with data: " + event.data);
  console.log("Comparing " + event.origin + " and " + ipAddress);

  if (event.origin === ipAddress) {
    if (event.data === "ready") {
      clearTimeout(checkReady); // clear the timer if the event is triggered
      
      callStarted = true;
      const mhName = sessionStorage.getItem('mhFNameCurrent');
      const mhNameLast = sessionStorage.getItem('mhLNameCurrent');
      console.log("sending MH message");
      sendDataMessage("MH", mhName);

      // Make remotePlayerFrame unclickable
      const remotePlayerFrame = document.getElementById('remotePlayerFrame');
      remotePlayerFrame.style.pointerEvents = 'none';
      remotePlayerFrame.setAttribute('tabindex', '-1');
      window.focus();
      console.log("done setting up MH");

      const headerContainer = document.getElementById('header-container');
      const videoElement = document.getElementById("cameraElement");
      const recordButton = document.getElementById('recordButton');
      const videoButton = document.getElementById('videoButton');
      const hangupButton = document.getElementById('hangupButton');
      const recordButtonHolder = document.querySelector('.recordButtonHolder');
      const pElement = recordButtonHolder.querySelector('p');

      headerContainer.style.visibility = 'visible';
      videoElement.style.visibility = 'visible';
      recordButton.style.visibility = 'visible';
      videoButton.style.visibility = 'visible';
      hangupButton.style.visibility = 'visible';
      pElement.style.visibility = 'visible';

      
      sendFramesToFlask();

      // Adding name
      const nameElement = document.getElementById('botName');
      nameElement.innerHTML = mhName + " " + mhNameLast;

      var modal = document.getElementById('modalPopup');
      var content = modal.querySelector('.modal-content');
      var close = document.getElementById('modalClose');

      modal.style.display = "block";

      setTimeout(() => content.style.transform = `translateX(0px)`, 1000); // Slide right

      close.addEventListener('click', () => {
        content.style.transform = `translateX(-100vw)`; // Slide left
        setTimeout(() => modal.style.display = "none", 5000);
      });

      setTimeout(() => {
        content.style.transform = `translateX(-100vw)`; // Slide left
        setTimeout(() => modal.style.display = "none", 1000);
      }, 10000); // disappear after 10 seconds


      startTimer()
    } else {
      console.log("message data was not 'ready'");
    }
  } else {
    // The data was NOT sent from your site!
    // Be careful! Do not use it. This else branch is
    // here just for clarity, you usually shouldn't need it.
    console.log("There is an IP mismatch at chat.js");
    return;
  }
});

function sendDataMessage(category, item) {
  console.log("in sendBP, about to send " + category + ", " + item);
  let descriptor = {
    Category: category,
    Item: item
  };
  remotePlayerFrame.contentWindow.postMessage(descriptor, '*');
}

// DISPLAY TOGGLES

const vidButtons = document.getElementById('video-buttons');
// if the mouse does not hover over remotePlayerFrame for 5 seconds, hide the buttons
// when the mouse hovers over remotePlayerFrame, show the buttons
// do this with a fade in/out

let timer;

const remotePlayerHolder = document.getElementsByClassName('remotePlayerHolder')[0];
console.log("remotePlayerHolder:", remotePlayerHolder);

remotePlayerHolder.addEventListener('mouseenter', () => {
  // console.log("mouse entered");
  clearTimeout(timer);
  vidButtons.classList.add('show');
  vidButtons.style.opacity = 1;
});

remotePlayerHolder.addEventListener('mouseleave', () => {
  // console.log("mouse left");
  timer = setTimeout(() => {
    vidButtons.classList.remove('show');
    vidButtons.style.opacity = 0.2;
  }, 1500);
});

let isCamFullscreen = false;
cameraElement.addEventListener('click', () => {
  if (isCamFullscreen) {
    cameraElement.classList.remove('cameraElement-fullscreen');
    isCamFullscreen = false;
  } else {
    cameraElement.classList.add('cameraElement-fullscreen');
    isCamFullscreen = true;
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const socket = io.connect(location.origin + '/chat');

  socket.on('connect', () => {
    console.log('Connected to the server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from the server');
  });

  socket.on('occupied', (message) => {
    alert(message);
  });

  window.addEventListener('beforeunload', () => {
    socket.disconnect();
  });
});

// Keep track of the currently selected option
var selectedOptionIndex = -1;

function loadOptions(active = -1) {
  console.log("Active is " + active);
  var dropdownContent = document.getElementById('cameraDropdownContent');

  // Remove previously added options
  dropdownContent.innerHTML = '';

  cameraList.forEach(function (option, index) {
    console.log("Adding " + option);
    var newOption = document.createElement('span');
    newOption.textContent = option.text;

    if (index === active) {
      newOption.classList.add('active');
      selectedOptionIndex = active;
    }

    newOption.addEventListener('mouseover', function () {
      newOption.style.backgroundColor = "#ddd";
    });

    newOption.addEventListener('mouseout', function () {
      if (index !== selectedOptionIndex) {
        newOption.style.backgroundColor = "";
      }
    });

    newOption.onclick = function (event) { menuAction(option, index); };

    dropdownContent.appendChild(newOption);
  });
}

let isRecording = false;
function sendFramesToFlask() {
    console.log('sendFramesToFlask');
    isRecording = !isRecording;

    const video = document.getElementById('cameraElement');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    function sendFrame() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.5);
        // encodedImage = encodeURIComponent(imageData);
        const data = { "imageData": imageData, "isRecording": isRecording };
        const jsonData = JSON.stringify(data);

        // display image
        // const img = document.createElement('img');
        // img.src = imageData;
        // document.body.appendChild(img);

        const xhr = new XMLHttpRequest();
        var method = "POST";
        var url = "/chat";
        xhr.open(method, url, true);

        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(jsonData);

        const fps = 1; // fps to send camera frames to get emotion
        if (isRecording) {
            setTimeout(sendFrame, 1000 / fps);
        }
    }

    console.log('isRecording:', isRecording);
    console.log('sendFrame');
    sendFrame()
}

function menuAction(option, index) {
  console.log("You selected: " + option.text);

  // Reset background color of the previously selected option
  if (selectedOptionIndex !== -1) {
    var previousOption = document.getElementById('cameraDropdownContent').children[selectedOptionIndex];
    previousOption.style.backgroundColor = "";
    previousOption.classList.remove('active');
  }

  // Set the background color of the newly selected option
  var selectedOption = document.getElementById('cameraDropdownContent').children[index];
  selectedOption.style.backgroundColor = "#ddd";
  selectedOption.classList.add('active');
  selectedOptionIndex = index;

  const cameraId = option.value;
  updateCamera(cameraId);
  startCamera(cameraId);
}


function showMenu(event) {
  var dropdownContent = document.getElementById("cameraDropdownContent");
  var videoButton = document.getElementById("videoButton");

  // Check if the mouse is on the videoButton or dropdownContent
  if (
    event.relatedTarget === videoButton ||
    event.relatedTarget === dropdownContent ||
    dropdownContent.contains(event.relatedTarget) ||
    videoButton.contains(event.relatedTarget)
  ) {
    return; // Do not do anything
  }
  // console.log("show")
  document.getElementById("cameraDropdownContent").classList.toggle("show");
}

function hideMenu(event) {
  var dropdownContent = document.getElementById("cameraDropdownContent");
  var videoButton = document.getElementById("videoButton");

  // Check if the mouse is on the videoButton or dropdownContent
  if (
    event.relatedTarget === videoButton ||
    event.relatedTarget === dropdownContent ||
    dropdownContent.contains(event.relatedTarget) ||
    videoButton.contains(event.relatedTarget)
  ) {
    return; // Do not do anything
  }
  // console.log("hide")
  document.getElementById("cameraDropdownContent").classList.remove("show");
}

