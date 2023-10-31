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


function backButton_backPage() {
    window.location.assign("resume_upload");
}

function backButton_hideAdvancedSearch() {
    hideAdvancedSearch();
}

function showAdvancedSearch_enterKey(event) {
    if (event.keyCode === 13) { // Enter key
        $("#searchInsideButton").trigger("click.showAdvancedSearch");
    }
}

function runSearch() {
    let keywords = $("#searchField").val();
    let location = $("#searchFieldLocation").val();

    console.log(`Running search: keywords: "${keywords}", location: "${location}"`);
    createJobCardsFromJSON(keywords, location);

    $("#resultsColumnItems").empty();
    $("#resultBig").empty();
}

function showSmartMatchTip() {
    $("#smartMatchTipContent").clearQueue().fadeIn(175);
}
function hideSmartMatchTip() {
    $("#smartMatchTipContent").clearQueue().delay(100).fadeOut(200);
}

function updateUserName() {
    $("#renameOverlay").fadeOut("fast");
    $("#userFirstNameTitle").text($("#renameFNameField").val());
    fetch('/update_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstName: $("#renameFNameField").val(),
            lastName: $("#renameLNameField").val(),
        }),
    })
}

function showUpdateUserName() {
    $("#renameOverlay").fadeIn("slow");
    if (flaskUserFName && flaskUserFName.length > 0) {
        $("#renameFNameField").val(flaskUserFName);
    }
    if (flaskUserFName && flaskUserFName.length > 0) {
        $("#renameLNameField").val(flaskUserLName);
    }

    let renameSubmitButton = $("#renameSubmitButton");
    renameSubmitButton.off('click');
    renameSubmitButton.on('click', updateUserName);
    $("#renameFNameField, #renameLNameField").off('keyup');
    $("#renameFNameField, #renameLNameField").on('keyup', function (event) {
        if (event.keyCode === 13) {
            updateUserName();
        }
    });
}

$(document).ready(function () {
    $("#searchField, #searchFieldLocation").val("");

    $("#renameOpenButton").click(showUpdateUserName);

    $("#searchInsideButton").on('click.showAdvancedSearch', showAdvancedSearch);
    $("#searchInsideButton").on('click.runSearch', runSearch);

    $("#backButton").on('click.backPage', backButton_backPage);
    $("#smartMatchTip").hover(showSmartMatchTip, hideSmartMatchTip);

    $("#searchField").on('keyup.showAdvancedSearch', function (event) {
        showAdvancedSearch_enterKey(event);
    });

    $("#searchField, #searchFieldLocation").on('keyup.runSearch', function (event) {
        if (event.keyCode === 13) {
            runSearch();
        }
    });

    $("#searchInsideButton").on('click.showAdvancedSearch', function () {
        showAdvancedSearch();
    });

    $("#searchOutsideButton").on('click.runSearch', runSearch)

    $("#resultsColumn").scroll(function () {
        let resCol = $("#resultsColumn");
        let scrollPos = resCol.scrollTop()
        let scrollHeight = resCol.prop('scrollHeight');

        if (scrollPos > 0) {
            $("#fadeOutOverlayTop").fadeIn(100);
        } else {
            $("#fadeOutOverlayTop").fadeOut(100);
        }
        if (scrollPos + resCol.innerHeight() >= scrollHeight - 1) {
            $("#fadeOutOverlayBottom").fadeOut(100);
        } else {
            $("#fadeOutOverlayBottom").fadeIn(100);
        }
    });

    populateRecommendationCards();
});

$(window).on("resize", function () {
    setOverlayPostion();
});


function showAdvancedSearch() {
    $("#searchField").off('keyup.showAdvancedSearch');

    $("#backButton").off('click.backPage');

    $("#recommendedJobsContainer").fadeOut();
    $("#searchBar").fadeOut(500, () => {
        $("#advancedSearch").show();
        $("#searchInsideButton").hide();
        $("#searchBar").fadeIn(500);
    });
    $("#titleSection").slideUp(500, () => {
        $("#searchResults").fadeIn(500);
        setOverlayPostion();
        $("#backButton").on('click.hideAdvancedSearch', backButton_hideAdvancedSearch);
    });
}

function hideAdvancedSearch() {
    $("#searchField").on('keyup.showAdvancedSearch', function (event) {
        showAdvancedSearch_enterKey(event);
    });

    $("#backButton").off('click.hideAdvancedSearch');

    $("#searchBar").fadeOut(500, () => {
        $("#advancedSearch").hide();
        $("#searchInsideButton").show();
        $("#searchBar").fadeIn(500);
        $("#searchField, #searchFieldLocation").val("");
        $("#nextButton").removeClass("primary");
        $("#nextButton").addClass("disabled");
    });
    $("#searchResults").fadeOut(500, () => {
        $("#titleSection").slideDown(500, () => {
            $("#recommendedJobsContainer").fadeIn();
        });
        $("#backButton").on('click.backPage', backButton_backPage);
    });
}


function setOverlayPostion() {
    let overlay = $("#fadeOverlay");
    let resultsColumn = $("#resultsColumn");
    overlay.width(resultsColumn.width());
    overlay.height(resultsColumn.height());
    overlay.offset(resultsColumn.offset());
}

function populateRecommendationCards() {
    $("#recommendedJobsGrid").addClass("loading-background");
    fetch('/get_job_results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jobTitle: "software engineer",
            jobLocation: "san francisco",
            pageNumber: 1,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (!data || data.jobs_results.length == 0) {
                console.log("no results");
            } else {
                let i = 0;
                $(".loading-background").removeClass("loading-background");
                data.jobs_results.slice(0, 3).forEach(element => {
                    let newCard = createJobCard(element, i++);
                    let expandButton = document.createElement("div");

                    $(newCard).append();
                    $("#recommendedJobsGrid").append(newCard);
                });
            }
        })
        .catch(error => console.error('Error:', error));
}


var stored_json_data;

function createJobCardsFromJSON(jobTitle, jobLocation) {
    $("#noResultsMessage").hide();
    $("#resultsColumnItems").empty();
    $("#resultsColumn").addClass("loading-background");

    fetch('/get_job_results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jobTitle: jobTitle,
            jobLocation: jobLocation,
            pageNumber: 1,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (!data || data.jobs_results.length == 0) {
                $("#noResultsMessage").show();
                console.log("no results");
            } else {
                $("#noResultsMessage").hide();
                console.log(data);
                stored_json_data = data.jobs_results;
                let i = 0;
                let initialLoaded;
                data.jobs_results.forEach(element => {
                    let newCard = createJobCard(element, i)
                    $("#resultsColumnItems").append(newCard);
                    if (i === 0) initialLoaded = newCard;
                    i++;
                });
                $("#resultsColumnItems").scrollTop(0);
                $("#fadeOutOverlayBottom").fadeIn(100);
                if (i > 0) {
                    $("#resultBig").hide();
                    $(initialLoaded).click();
                }
            }
            $(".loading-background").removeClass("loading-background");
        })
        .catch(error => console.error('Error:', error));
}

// function sendJobSelection(data) {
//     console.log(data);

//     fetch('/random_mh', { method: 'GET' })
//         .then(response => response.json())
//         .then(bot_name => {
//             sessionStorage.setItem('mhFNameCurrent', bot_name.bot_fname);
//             sessionStorage.setItem('mhLNameCurrent', bot_name.bot_lname);

//             const jsonData = JSON.stringify(data);

//             const xhr = new XMLHttpRequest();
//             var method = "POST";
//             var url = "/jobs_search";
//             xhr.open(method, url, true);

//             xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

//             xhr.onload = function() {
//                 if (xhr.status === 200) {
//                     checkOccupiedAndNavigate();
//                 } else {
//                     console.log('Error with the request!');
//                 }
//             };
//             xhr.send(jsonData);
//         })
// }

function createJobCard(data, id) {
    let newElem = document.createElement("div");
    newElem.classList.add("job-card");
    let thumbnailPathStyle = `style='background-image: url("${data.thumbnail}")';`
    newElem.innerHTML =
        `
            <h1 class="font-bold">${data.title}</h1>
            <div class="company-badge">
            <div class="job-card-img" ${data.thumbnail ? thumbnailPathStyle : ""}></div>
            <div class="job-card-text-container">
                <p class="font-normal">${data.company_name}</p>
                <p class="font-normal">${data.location}</p>
            </div>
        `;

    newElem.addEventListener('click', function () {
        if (!$(newElem).hasClass("selected")) {
            $("#nextButton").removeClass("disabled");
            $("#nextButton").addClass("primary");
            $("#nextButton").off("click");
            $("#nextButton").on("click", () => {
                // save data to session storage
                // console.log(data.title);
                sessionStorage.setItem('jobData', JSON.stringify(data));

                // console.log(JSON.parse(sessionStorage.getItem('jobData')).title);

                window.location.href = "/gallery";
                // sendJobSelection(data);
            });
            $(".job-card.selected").removeClass("selected");
            $(newElem).addClass("selected");
            populateBigCard(id);
        }
    });

    return newElem;
}

function populateBigCard(index) {
    if (stored_json_data) {
        let data = stored_json_data[index];
        if (data) {
            $("#resultBig").hide();
            let newElem = document.createElement("div");
            newElem.id = "jobCardBig";

            let jobHighlightsList = [];

            data.job_highlights.forEach(highlight => {
                let title = highlight.title ? highlight.title : "Description";
                let highlightContainer = $(`<div class="font-bold"><p class="font-bold">${title}</p></div>`);
                let highlightList = $("<ul></ul>");

                highlight.items.forEach(item => {
                    let listItem = $(`<li class="font-normal">${item}</li>`);
                    highlightList.append(listItem);
                });

                highlightContainer.append(highlightList)

                jobHighlightsList.push(highlightContainer);
            });

            newElem.innerHTML =
                `
                <div id="jobCardBigContentContainer">
                    <div id="jobCardBigTitleContainer">
                        <h1>${data.title.trim()}</h1>
                        <div id="jobCardBigTextContainer">
                            <p class="font-bold">${data.company_name.trim()}</p>
                            <p class="font-normal">${data.location.trim()}</p>
                        </div>
                    </div>
                    <div id="jobCardBigExtensionsAndExternalContainer" class="my-1rem flex justify-space-between">
                        <div id="jobCardBigExtensionsContainer" class="flex gap-5rem">
                        </div>
                    </div>
                    <div>
                        <div id="jobCardBigHighlightsContainer">
                        </div>
                    </div>
                </div>
            `;

            $("#resultBig").empty();
            $("#resultBig").innerHTML = "";
            $("#resultBig").append(newElem);

            const extensionIconMap = {
                "posted_at": '<svg class="text-icon h-1p5em svg-text-dark" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M256 48C141.13 48 48 141.13 48 256s93.13 208 208 208 208-93.13 208-208S370.87 48 256 48zm96 240h-96a16 16 0 01-16-16V128a16 16 0 0132 0v128h80a16 16 0 010 32z"/></svg>',
                "schedule_type": '<svg class="text-icon h-1p5em svg-text-dark" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M336 80H176a16 16 0 00-16 16v16h192V96a16 16 0 00-16-16z" fill="none"/><path d="M496 176a64.07 64.07 0 00-64-64h-48V96a48.05 48.05 0 00-48-48H176a48.05 48.05 0 00-48 48v16H80a64.07 64.07 0 00-64 64v48h480zm-144-64H160V96a16 16 0 0116-16h160a16 16 0 0116 16zM336 264a24 24 0 01-24 24H200a24 24 0 01-24-24v-4a4 4 0 00-4-4H16v144a64 64 0 0064 64h352a64 64 0 0064-64V256H340a4 4 0 00-4 4z"/></svg>',
                "salary": '<svg class="text-icon h-1p5em svg-text-dark" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M240 480v-36.42C160.53 439 112.25 398.06 112 336h72c1.77 26.34 23.86 46.45 56 50v-98l-26.77-7c-61-14.18-93.64-49.39-93.64-102.08C119.59 116.81 164.08 76.08 240 70V32h32v38c77.39 6.3 119 47.74 120 106h-72c-.76-24.06-15.83-43.39-48-46v92l30.82 7.28C367.61 243.46 400 277 400 332c0 64.34-43.74 105.88-128 111.32V480zm0-264v-86c-27.59 1.52-47.27 18.47-47.27 42.53 0 22.3 16.39 36.88 47.27 43.47zm32 78v92c38.15-1.54 56.38-18.92 56.38-45.77 0-24.58-18.23-41.13-56.38-46.23z"/></svg>',
            };
            ["posted_at", "schedule_type", "salary"].forEach(extension => {
                let extValue = data.detected_extensions[extension];
                if (extValue) {
                    $("#jobCardBigExtensionsContainer").append(
                        $(`<div class="flex v-center">
                            ${extensionIconMap[extension]}
                            <p class="font-normal">${extValue}</p>
                        </div>`)
                    );
                }
            });

            let decodedJobId = JSON.parse(atob(data.job_id));
            let htidocid = decodedJobId.htidocid;
            let jobLink = "https://www.google.com/search?ibp=htl;jobs&q=" + data.title + "#htivrt=jobs&htidocid=" + htidocid;

            $("#jobCardBigExtensionsAndExternalContainer").append($(`<button class='primary font-bold'>View on Google Jobs</button>`).click(function () {
                window.open(jobLink, '_blank');
            }));

            jobHighlightsList.forEach(element => {
                $("#jobCardBigHighlightsContainer").append(element);
            });

            $("#resultBig").show();
        }
    }
}

// function checkOccupiedAndNavigate() {
//     fetch('/is_chat_occupied')
//         .then(response => response.json())
//         .then(data => {
//             if (data.occupied) {
//                 alert('The chat is currently occupied, please wait.');
//             } else {
//                 window.location.href = '/chat';
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
// }
