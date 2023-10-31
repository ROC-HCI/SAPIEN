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


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    const socket = io.connect(location.origin + '/wait');

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

let $timeLabel;

$(document).ready(function () {
    $("#backButton").click(() => {
        var modePage = localStorage.getItem('mode_page');
        window.location.href = "/" + modePage;
    });

    $timeLabel = $("#timeLabel");

    var interval = window.setInterval(function () {
        updateTime();
    }, 1000);
});

function formatSeconds(sec) {
    if (sec <= 0) return '0:00';

    var hours = Math.floor(sec / 3600);
    var minutes = Math.floor((sec - (hours * 3600)) / 60);
    var seconds = sec - (hours * 3600) - (minutes * 60);

    if (seconds < 10) { seconds = "0" + seconds; }

    if (hours === 0) {
        return minutes + ':' + seconds;
    } else {
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10 && hours !== 0) { minutes = "0" + minutes; }
        return hours + ':' + minutes + ':' + seconds;
    }
}

function updateTime() {
    fetch('/poll')
        .then(response => response.json())
        .then(data => {
            if (data.status === "ready") {
                window.location.href = "/chat";
            } else {
                let time = formatSeconds(data.wait_time);
                // console.log(time);
                $timeLabel.text(time);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            // window.location.href = "/";
        });
}