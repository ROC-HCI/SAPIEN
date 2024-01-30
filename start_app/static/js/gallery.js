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


const headshots = ['Ada', 'Chandra', 'Cooper', 'Danielle', 'Dhruv', 'Erno', 'Farrukh', 'Glenda', 'Hadley', 'Hana', 'Hudson', 'Jesse', 'Keiji', 'Kendra', 'Koda', 'Lena', 'Maria', 'Myles', 'Nasim', 'Natalia', 'Orla', 'Oskar', 'Pia', 'Sadhil', 'Seneca', 'Sook-ja', 'Vincent', 'Vivian', 'Wallace', 'Zeva', 'Zhen']

$(document).ready(function () {
    navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
            devices.forEach(function (device) {
                console.log(device.kind + ": " + device.label +
                    " id = " + device.deviceId);
            });
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });

    displayMetahumansInitial();

    let nextButton = $("#nextButton");
    headshots.forEach(img => {
        let item = $(`<div class="headshot" id="headshot-${img}"></div>`);
        let image = $(`<img draggable="false" src="static/img/headshots/${img}.png" alt="${img}" loading="lazy">`);
        let label = $(`<p class="label">${img}</p>`);
        let tooltip = $(`<div class="hoverInfo" style="display: none;"></div>`);

        item.append(image);
        item.append(label);
        item.append(tooltip);

        item.hover(function () {
            label.fadeIn(200);
            if (localStorage.getItem('mode') === 'dating') {
                // item.find('.hoverInfo').fadeIn(200);
            }
        }, function () {
            label.fadeOut(200);
            if (localStorage.getItem('mode') === 'dating') {
                // item.find('.hoverInfo').fadeOut(200);
            }
        });

        item.click(function () {
            if (!$(this).hasClass("unclickable")) {
                $(".selected").removeClass("selected");
                $(this).addClass("selected");
                if (micPermission) {
                    nextButton.addClass("primary");
                    nextButton.removeClass("disabled");
                }
                nextButton.off('click');
                nextButton.on('click', function () {
                    if (!nextButton.hasClass("disabled")) {
                        checkOccupiedAndNavigate();
                    }
                });
            }
        });
        $("#galleryGrid").append(item);
    });

    $("#backButton").click(() => {
        console.log(localStorage.getItem('mode'));
        if (localStorage.getItem('mode') === 'dating') {
            window.location.assign('/mode_select');
        } else {
            modePage = localStorage.getItem('mode_page');
            window.location.assign(modePage);
        }
    });
});



class MetaHuman {
    id;
    name;
    gender;
    age;
    imgSrc;
    narrative;
    funFact;
    profession;
    hasVideo;

    constructor(newId, newName, newGender, newAge, newImgSrc, newNarrative, newFunFact, newProfession, hasVideo) {
        this.id = newId;
        this.name = newName;
        this.gender = newGender;
        this.age = newAge;
        this.imgSrc = newImgSrc;
        this.narrative = newNarrative;
        this.funFact = newFunFact;
        this.profession = newProfession;
        this.hasVideo;
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getGender() {
        return this.gender;
    }
    getAge() {
        return this.age;
    }
    getImg() {
        return this.imgSrc;
    }
    getNarrative() {
        return this.narrative;
    }
    getFunFact() {
        return this.funFact;
    }
    getProfession() {
        return this.profession;
    }
    getHasVideo() {
        return this.hasVideo;
    }
}

let metahumans = [];
let mhFilename = [];
let mhFName = [];
let mhLName = [];
let mhPronoun = [];
let mhAge = [];
let mhNarrative = [];
let mhFunFact = [];
let mhProfession = [];
let mhHasVideo = [];

function displayMetahumansInitial() {

    async function getMetahumans() {
        const response = await fetch('static/sapien-data/sapien_data.json');
        const data = await response.json();

        data.SAPIEN.forEach(person => {
            mhFilename.push(person.Filename);
            mhFName.push(person['First Name']);
            mhLName.push(person['Last Name']);
            mhPronoun.push(person.Pronoun);
            mhAge.push(person.Age);
            mhNarrative.push(person['Narrative-text']);
            mhFunFact.push(person['Fun-fact']);
            mhProfession.push(person.Profession);
            mhHasVideo.push(person.has_video);
        });
    }

    (async () => {
        await getMetahumans();
        async function getMetahumanData() {
            for (var i = 0; i < mhFilename.length; i++) {
                const filename = mhFilename[i];

                const age = mhAge[i];

                const pronounMap = {
                    "He/Him": "Male",
                    "She/Her": "Female",
                    "They/Them": "Nonbinary"
                };

                const narrative = mhNarrative[i];
                const funFact = mhFunFact[i];
                const profession = mhProfession[i];
                const hasVideo = mhHasVideo[i];

                const mh = new MetaHuman(i, mhFName[i], pronounMap[mhPronoun[i]], age, filename, narrative, funFact, profession, hasVideo);
                metahumans.push(mh);

                const tooltip = $(`.headshot:nth-child(${i + 1}) .hoverInfo`);
                tooltip.text(`Age: ${mh.getAge()} \n Narrative: ${mh.getNarrative()} \n Fun Fact: ${mh.getFunFact()} \n Profession: ${mh.getProfession()}`);


                let scriptTag = document.querySelector('script[src="static/js/gallery.js"]');
                let prerendered = scriptTag.getAttribute('prerendered');
                console.log("prerendered: " + prerendered);
                if ((!hasVideo) && (prerendered == 'True')) {
                    const name = mh.getName();
                    $(`#headshot-${name}`).addClass("unclickable");
                }
            }
        }
        (async () => {
            await getMetahumanData();
        })();
    })();
}

function saveMHData(name) {
    const index = metahumans.find(mh => mh.getName() === name).getId();

    const data = {
        mhFilenameCurrent: mhFilename[index],
        mhFNameCurrent: mhFName[index],
        mhLNameCurrent: mhLName[index],
        mhPronounCurrent: mhPronoun[index],
        mhAgeCurrent: mhAge[index],
        mhNarrativeCurrent: mhNarrative[index],
        mhFunFactCurrent: mhFunFact[index],
        mhProfessionCurrent: mhProfession[index]
    }

    for (var key in data) {
        sessionStorage.setItem(key, data[key]);
    }
}

function checkOccupiedAndNavigate() {
    showLoading();
    let selectedName = $(".selected > p").text();
    saveMHData(selectedName);
    const mode = localStorage.getItem('mode');
    if (mode === 'interview') {
        setup_interview(JSON.parse(sessionStorage.getItem('jobData')));
    } else if (mode === 'learning') {
        setup_learning();
    } else if (mode === 'language') {
        setup_language();
    } else if (mode === 'dating') {
        setup_dating();
    } else if (mode === 'community') {
        setup_community();
    }
    
    // window.location.href = '/wait';
    // console.log("wait");
}

function setup_interview(jobData) {
    var mhFNameCurrent = sessionStorage.getItem('mhFNameCurrent');
    var mhLNameCurrent = sessionStorage.getItem('mhLNameCurrent');
    var mhPronounCurrent = sessionStorage.getItem('mhPronounCurrent');

    const jsonData = JSON.stringify({
        "jobData": jobData,
        "mhFNameCurrent": mhFNameCurrent,
        "mhLNameCurrent": mhLNameCurrent,
        "mhPronounCurrent": mhPronounCurrent
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/gallery";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Success!');
            // checkOccupiedAndNavigate();
            window.location.href = '/wait';
        } else {
            console.log('Error with the request!');
        }
    };
    xhr.send(jsonData);
}

function setup_learning() {
    var mhFNameCurrent = sessionStorage.getItem('mhFNameCurrent');
    var mhLNameCurrent = sessionStorage.getItem('mhLNameCurrent');
    var mhPronounCurrent = sessionStorage.getItem('mhPronounCurrent');

    const jsonData = JSON.stringify({
        "mhFNameCurrent": mhFNameCurrent,
        "mhLNameCurrent": mhLNameCurrent,
        "mhPronounCurrent": mhPronounCurrent
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/gallery";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Success!');
            // checkOccupiedAndNavigate();
            window.location.href = '/wait';
        } else {
            console.log('Error with the request!');
        }
    };
    xhr.send(jsonData);
}

function setup_language() {
    var mhFNameCurrent = sessionStorage.getItem('mhFNameCurrent');
    var mhLNameCurrent = sessionStorage.getItem('mhLNameCurrent');
    var mhPronounCurrent = sessionStorage.getItem('mhPronounCurrent');

    const jsonData = JSON.stringify({
        "mhFNameCurrent": mhFNameCurrent,
        "mhLNameCurrent": mhLNameCurrent,
        "mhPronounCurrent": mhPronounCurrent
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/gallery";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Success!');
            // checkOccupiedAndNavigate();
            window.location.href = '/wait';
        } else {
            console.log('Error with the request!');
        }
    };
    xhr.send(jsonData);
}

function setup_dating() {
    var mhFNameCurrent = sessionStorage.getItem('mhFNameCurrent');
    var mhLNameCurrent = sessionStorage.getItem('mhLNameCurrent');
    var mhPronounCurrent = sessionStorage.getItem('mhPronounCurrent');
    var mhNarrativeCurrent = sessionStorage.getItem('mhNarrativeCurrent');
    var mhFunFactCurrent = sessionStorage.getItem('mhFunFactCurrent');
    var mhProfessionCurrent = sessionStorage.getItem('mhProfessionCurrent');

    const jsonData = JSON.stringify({
        "mhFNameCurrent": mhFNameCurrent,
        "mhLNameCurrent": mhLNameCurrent,
        "mhPronounCurrent": mhPronounCurrent,
        "mhNarrativeCurrent": mhNarrativeCurrent,
        "mhFunFactCurrent": mhFunFactCurrent,
        "mhProfessionCurrent": mhProfessionCurrent
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/gallery";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Success!');
            // checkOccupiedAndNavigate();
            window.location.href = '/wait';
        } else {
            console.log('Error with the request!');
        }
    };
    xhr.send(jsonData);
}

function setup_community() {
    var mhFNameCurrent = sessionStorage.getItem('mhFNameCurrent');
    var mhLNameCurrent = sessionStorage.getItem('mhLNameCurrent');
    var mhPronounCurrent = sessionStorage.getItem('mhPronounCurrent');
    var mhNarrativeCurrent = sessionStorage.getItem('mhNarrativeCurrent');
    var mhFunFactCurrent = sessionStorage.getItem('mhFunFactCurrent');
    var mhProfessionCurrent = sessionStorage.getItem('mhProfessionCurrent');

    const jsonData = JSON.stringify({
        "mhFNameCurrent": mhFNameCurrent,
        "mhLNameCurrent": mhLNameCurrent,
        "mhPronounCurrent": mhPronounCurrent,
        "mhNarrativeCurrent": mhNarrativeCurrent,
        "mhFunFactCurrent": mhFunFactCurrent,
        "mhProfessionCurrent": mhProfessionCurrent
    });

    const xhr = new XMLHttpRequest();
    var method = "POST";
    var url = "/gallery";
    xhr.open(method, url, true);

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Success!');
            // checkOccupiedAndNavigate();
            window.location.href = '/wait';
        } else {
            console.log('Error with the request!');
        }
    };
    xhr.send(jsonData);
}

function showLoading() {
    $("#loadingContainer").fadeIn(500);
}

var micPermission = false;

$(document).ready(() => {
    checkMicAndCamera();
});

function checkMicAndCamera() {
    checkMicrophonePermission().then(async function (result) {
        if (result.state === 'granted') {
            updateMicIndicator('granted');
        } else {
            askForMicrophonePermission().then(function (result) {
                if (result) {
                    updateMicIndicator('granted');
                    checkCameraPermission().then(async function (result) {
                        if (result) {
                            updateCamIndicator('granted');
                        } else {
                            updateCamIndicator('prompt');
                            askForCameraPermission().then(function (result) {
                                if (result) {
                                    updateCamIndicator('granted');
                                } else {
                                    updateCamIndicator('denied');
                                }
                            });
                        }
                    }).catch(function (err) {
                        console.log("cam perms error", err);
                    });
                } else {
                    updateMicIndicator('denied');
                    alert("We are unable to access your microphone. Please update your browser or system settings and reload the page.");
                }
            });
        }
    }).catch((err) => {
        console.log("checkMicrophonePermission error", error);
    });
}

function loadDropdown() {
}

function updateIndicator($indicator, $check, state, selectID) { // state = "granted" / "prompt" / "denied"
    $indicator.removeClass("indicator-red indicator-yellow indicator-green");
    $check.children('*').hide();
    switch (state) {
        case "granted":
            $check.children('.granted').show();
            $indicator.addClass("indicator-green");
            populateDevices(selectID);
            break;
        case "prompt":
            $check.children('.prompt').show();
            $indicator.addClass("indicator-yellow");
            break;
        case "denied":
            $check.children('.denied').show();
            $indicator.addClass("indicator-red");
            
            const selectElement = document.getElementById(selectID);
            selectElement.options[0].textContent = "No device found";
            break;
        default:
            console.error(`updateIndicator invalid argument: ${state}`)
    }
}

function updateMicIndicator(state) { // state = "granted" / "prompt" / "denied"
    micPermission = state === 'granted' ? true : false;
    updateIndicator($("#microphone"), $("#microphoneCheck"), state, "microphoneSelect")
}

function updateCamIndicator(state) { // state = "granted" / "prompt" / "denied"
    updateIndicator($("#camera"), $("#cameraCheck"), state, "cameraSelect")
}

async function checkMicrophonePermission() {
    return navigator.permissions.query({ name: 'microphone' }).then(async function (result) {
        return result.state === 'granted';
    })
}

async function checkCameraPermission() {
    navigator.permissions.query({ name: 'camera' }).then(async function (result) {
        return result.state === 'granted';
    }).catch(function (err) {
        return false;
    })
}

async function askForMicrophonePermission() {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        return true;
    }).catch(function (err) {
        return false;
    });
}

async function askForCameraPermission() {
    return navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
        return true;
    }).catch(function (err) {
        return false;
    });
}

function populateDevices(selectID) {
    const selectElement = document.getElementById(selectID);
    
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
        devices.forEach(function(device) {
            if(selectID === 'microphoneSelect' && device.kind === 'audioinput'){
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || 'microphone ' + (selectElement.length + 1);
                selectElement.appendChild(option);
            }
            else if(selectID === 'cameraSelect' && device.kind === 'videoinput'){
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || 'camera ' + (selectElement.length + 1);
                selectElement.appendChild(option);
            }
        });
    })
    .catch(function(err) {
        console.log(err.name + ": " + err.message);
    });

    selectElement.disabled = false;
}
