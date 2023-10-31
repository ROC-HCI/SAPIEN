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


// const feedbackData = `
// {
//     "metrics" : [
//         {
//             "title":"Clarity",
//             "points": [
//                 "The clarity in your responses could be improved. You seem to have strong technical knowledge, but sometimes it was hard to follow your line of thought due to the excessive use of technical jargon. Try to simplify your language and break down complex ideas into easily understandable parts. This will ensure that your message, skills, and abilities are properly conveyed.",
//                 "You need to be more specific when answering questions about your experiences and skills. Try to clearly state what you did, why you did it, what were the results, and what you learned from the situation."
//             ]
//         },
//         {
//             "title":"Friendliness",
//             "points": [
//                 "You displayed a warm and professional demeanor during your interview. Your friendly nature, appropriate body language, and positivity helped build a strong bond with the interviewers.",
//                 "However, to further connect on a personal level, try to show genuine interest in the company's values and work culture. Ask meaningful questions about these aspects, and share how you feel you could fit and contribute to such an environment."
//             ]
//         },
//         {
//             "title":"STAR Method",
//             "points": [
//                 "You quite effectively used the STAR technique to share applicable examples of work experiences. Your stories were relevant and demonstrated your skills aptly. ",
//                 "However, when tackling the 'Result' part of the STAR technique, remember to make explicit the outcome or impact of your actions. Be sure to mention measurable achievements or specific changes that were brought about owing to your initiatives."
//             ]
//         }
//     ]
// }`;


function populateFeedback(data) {
    data.metrics.forEach(metric => {
        let container = $(`
            <div class="feedback-metric">
                <h2 class="font-bold">${metric.title}</h2>
            </div>
        `);

        let points = $('<ul></ul>');
        metric.points.forEach(point => {
            points.append($(`<li class="font-normal">${point}</li>`));
        });

        container.append(points);

        $("#feedbackBox").append(container);
    });
}

function errorFeedback(error) {
    let container = $(`
        <div class="feedback-metric">
            <h2 class="font-bold">Something went wrong.</h2>
        </div>
    `);

    let points = $('<ul></ul>');
    points.append($(`<li class="font-normal">${error}</li>`));

    container.append(points);

    $("#feedbackBox").append(container);
}

$(document).ready(function () {
    $("#restartButton").click(() => {
        fetch('/clear_transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => {
            window.location.assign("chat");
        })
        .catch((error) => {
            console.error('Cannot clear transcript:', error);
        });
    });
    $("#backButton").click(() => {
        window.location.assign("jobs_search");
    });
    $("#homeButton").click(() => {
        window.location.assign("/");
    });

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/get_interview_feedback');
    xhr.send();
    xhr.onload = function () {
        if (xhr.status == 200) {
            try {
                // const feedbackData = JSON.parse(xhr.responseText);
                console.log(feedbackData);

                // Parse the Inner JSON String
                // const innerData = JSON.parse(feedbackData.full_feedback);
                const innerData = feedbackData.full_feedback;
                populateFeedback(innerData);
            } catch (error) {
                console.log('Error parsing feedback data, it might not be json: ', error);
                errorFeedback(JSON.parse(xhr.responseText).full_feedback);
            }
        } else {
            console.log('Request failed. Returned status of ' + xhr.status);
        }
    }
});