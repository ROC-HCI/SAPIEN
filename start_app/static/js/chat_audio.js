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


$(function () {
  $('a#start_meeting').on('click', function (e) {
    e.preventDefault()
    $.getJSON('/start_conversation',
      function (data) {
        //do nothing
      });
    return false;
  });
});

$(function () {
  $('a#stop_meeting').on('click', function (e) {
    e.preventDefault()
    $.getJSON('/end_conversation',
      function (data) {
        //do nothing
      });
    return false;
  });
});

document.addEventListener("keydown", function (event) { // Only limit this to Chat page
  if (event.code === "Space") {
    event.preventDefault(); // Prevents scrolling in some browsers
    startRecording();
  }
});

// var startTime = 0;
// var endTime = 0;

document.addEventListener("keyup", function (event) {
  if (event.code === "Space") {
    event.preventDefault(); // Prevents scrolling in some browsers
    stopRecording();
    // print the current time and save it to a startTime variable
    // startTime = new Date().getTime();
    // console.log("startTime: " + startTime);
  }
});

const recordButton = document.getElementById('recordButton');
const imageElement = recordButton.getElementsByTagName('img')[0];
// const audioPlayer = document.getElementById('audioPlayer');

let mediaRecorder;
let recordedChunks = [];

// The important variable that decides whether to let user start recording
// Two conditions: Can't talk right after you said something. Can't talk while bot is speaking
let isAvailable = true;

async function startRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") return;

  if (!isAvailable) {
    document.getElementById("message").textContent = "Please wait for " + sessionStorage.getItem('mhFNameCurrent') + " to finish their turn.";
    showMessage();
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();

  imageElement.src = '/static/img/speak.png';
  // document.body.style.backgroundColor = "red";
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state !== "recording") return;
  isAvailable = false;

  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach(track => track.stop());

  imageElement.src = '/static/img/mute.png';
  // document.body.style.backgroundColor = "";
  console.log('stopped recording');
  // playAudio()
}

recordButton.addEventListener('mousedown', startRecording);
recordButton.addEventListener('mouseup', stopRecording);


async function handleDataAvailable(event) {
  console.log("handleDataAvailable called");
  if (event.data.size > 1000) {
    recordedChunks.push(event.data);
    let isUploadSuccessful = await uploadAudio(); // wait for uploadAudio to finish
    if (isUploadSuccessful) {
      console.log("Audio recorded");
      endTime = new Date().getTime();
      // console.log("endTime: " + endTime);
      // console.log("Time taken: " + (endTime - startTime) + " miliseconds");
      playAudio();
    }
  } else {
    console.log("No data recorded");
    isAudioPlaying = false;
    isAvailable = true;
    imageElement.src = '/static/img/available.png';
  }
}


let isAudioPlaying = false;

async function playAudio() {
  if (isAudioPlaying) {
    console.log("Audio is currently playing, please wait.");
    return;
  }

  try {
    console.log("Inside Play Audio");
    const response = await fetch("/get_audio");
    if (response.ok) {
      console.log("response ok")
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
      isAudioPlaying = true;
      console.log("Audio played successfully.");

      audioSource.onended = async function () {
        isAudioPlaying = false;
        isAvailable = true;
        imageElement.src = '/static/img/available.png';
        // await deleteAudio();
      };
    } else {
      console.error("Error fetching audio. Releasing microphone.");
      isAudioPlaying = false;
      isAvailable = true;
      imageElement.src = '/static/img/available.png';
    }
  } catch (error) {
    console.error("Error occurred:", error, ". Releasing microphone.");
    isAudioPlaying = false;
    isAvailable = true;
    imageElement.src = '/static/img/available.png';
  }
}

async function uploadAudio() {
  const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("audio_data", audioBlob);

  console.log("Uploading audio...");

  const response = await fetch("/upload_audio", {
    method: "POST",
    body: formData
  });

  console.log("Response will be checked.");

  if (response.ok) {
    console.log("Audio uploaded successfully.");
  } else {
    console.error("Error uploading audio. Releasing microphone.");
    isAudioPlaying = false;
    isAvailable = true;
    imageElement.src = '/static/img/available.png';
  }
  recordedChunks = [];
  return response.ok;
}

function endCall() {
  if ((localStorage.getItem('mode') === "interview")) {
    window.location.href = "/ask_feedback";
  } else if (localStorage.getItem('mode') === "learning") {
    window.location.href = "/ask_quiz";
  } else if (localStorage.getItem('mode') === "language") {
    window.location.href = "/ask_feedback";
  } else if (localStorage.getItem('mode') === "dating") {
    window.location.href = "/ask_feedback";
  } else if (localStorage.getItem('mode') === "custom") {
    window.location.href = "/ask_feedback";
  } else if (localStorage.getItem('mode') === "ptsd") {
    window.location.href = "/ptsd";
  } else if (localStorage.getItem('mode') === "community") {
    window.location.href = "/community";
  }
}

function showMessage() {
  const message = document.getElementById('message');
  message.classList.remove('hidden');
  message.style.opacity = '1';

  // Hide the message after 2 seconds
  setTimeout(function () {
    message.style.opacity = '0';
    // Also add the hidden class back after the transition is done
    setTimeout(function () {
      message.classList.add('hidden');
    }, 300);
  }, 3000);
}