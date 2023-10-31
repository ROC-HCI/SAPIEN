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


function hideLoading() {
    $("#loadingContainer").fadeOut(500);
}

function getQuiz() {
    $.ajax({
        url: '/get_quiz',
        type: 'GET',
        success: function (data) {
            console.log(data);
            populateQuizFromData(data);
            hideLoading();

            $(".answer").click(function () {
                selectAnswer($(this));
                $(this).parent().parent().attr("selected_answer", $(this).attr("answer_letter"));
            });
        
            $("#nextButton").click(() => { correctQuiz(data) });
            $("#nextButton").removeClass("disabled secondary");
            $("#nextButton").addClass("primary");
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function createAnswers(answers) {
    let letters = ['A','B','C','D','E','F'];

    answersHTML = "";

    letters.slice(0, Object.keys(answers).length).forEach(letter => {
        answersHTML += `
            <div class="answer flex flex-row v-center" answer_letter="${letter}">
                <div class="radio-button flex flex-row">
                    <svg class="radio-icon svg-text-dark" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"/>
                        <path d="M0 0h48v48H0z" fill="none"/>
                    </svg>
                </div>
                <p class="font-normal"><span class="font-bold">${letter}.</span> ${answers[letter]}</p>
            </div>
        `;
    })

    return answersHTML;
}

function createQuestion(index, question) {
    let questionHTML = $(`
        <div class="question flex flex-row h-center" correct_answer="${question.correct}">
            <div class="question-box flex">
                <div class="flex flex-col">
                    <h2 class="font-bold">Question ${index}</h2>
                    <p class="font-normal text-justify">${question.question}</p>
                </div>
            </div>
            <div class="answer-box">
                ${createAnswers(question.answers)}
            </div>
        </div>
        <hr>
    `);

    return questionHTML;
}

function populateQuizFromData(data) {
    console.log("populating");
    $("#topicLabel").text(data.topic);

    let i = 1;
    data.questions.forEach(question => {
        let questionHTML = createQuestion(i++, question);

        $("#quizBox").append(questionHTML);
    });
}

const radioSVG = $('<svg class="radio-icon svg-text-dark" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"/><path d="M0 0h48v48H0z" fill="none"/></svg>')
const radioClickedSVG = $('<svg class="radio-icon svg-text-dark" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M24 14c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0-10C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"/><path d="M0 0h48v48H0z" fill="none"/></svg>')


function selectAnswer(clicked) {
    let neighbors = clicked.parent().children(".answer");
    neighbors.removeClass("selected");
    neighbors.children(".radio-button").empty();
    neighbors.children(".radio-button").append(radioSVG.clone());

    clicked.addClass("selected");
    clicked.children(".radio-button").empty();
    clicked.children(".radio-button").append(radioClickedSVG.clone());
}

function correctQuiz(data) {
    $(".answer").off('click');

    console.log("grading...");

    let red = "rgba(195, 82, 82, 1)";
    let red_transparent = "rgba(195, 82, 82, 0.3)";
    let green = "rgba(84, 195, 82, 1)";
    let green_transparent = "rgba(84, 195, 82, 0.3)";

    let correct = 0;
    let total = 0;
    $(".question").each(function (index) {
        let selectedAnswer = $(this).attr("selected_answer");
        let correctAnswer = $(this).attr("correct_answer");
        if (selectedAnswer === correctAnswer) {
            correct++;
            $(this).find(".question-box h2").css("color", green);
            $(this).find(".selected").css("background-color", green_transparent);
        } else {
            $(this).find(".question-box h2").css("color", red);
            $(this).find(".answer.selected").css("background-color", red_transparent);
            $(this).find(`.answer[answer_letter="${$(this).attr('correct_answer')}"]`).css("background-color", green_transparent);
        }
        total++;
    });

    $("#topicLabel").parent().text(`Score: ${correct} / ${total}`);
    $("#scrollContainer").animate({
        scrollTop: 0,
    }, 300);

    $("#nextButton").removeClass("primary");
    $("#nextButton").addClass("disabled");

    $("#nextButton").css("display", "none");
    $("#backButton").css("display", "inline-block");
    $("#homeButton").css("display", "inline-block");
}

$(document).ready(function () {
    getQuiz();

    $("#backButton").click(() => {
        window.location.assign("enter_topic");
    });
    $("#homeButton").click(() => {
        window.location.assign("/");
    });
});