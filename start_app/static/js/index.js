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


var $backgroundVideo;
var $backToTopButton;

$(document).ready(function () {
    $backgroundVideo = $("#backgroundVideo");
    $backToTopButton = $("#backToTop");

    $backToTopButton.click(function () {
        $(window).scrollTop(0);
    });
    
    setupVideoCarousel();

    $("#burger").click(showBurgerMenu);
    $("#closeBurger").click(hideBurgerMenu);
    
    $('.signin-button').click(function () {
        // let code = prompt("Please enter your 4-digit Access Code (provided by the authors):");
        let code = "ABCD"
        if (code.length > 0) {
            fetch('/login_access_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_code: code,
                }),
            }).then(response => response.json())
            .then(data => {
                if (data.result == "invalid") {
                    alert('Invalid Access Code. Please try again or Request Access');
                } else {
                    window.location.href = data.result;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});

$(window).scroll(function() {
    if ($(window).scrollTop() >= $backgroundVideo.height()) {
        $backToTopButton.fadeIn(300);
        $backgroundVideo.hide();
    } else {
        $backToTopButton.fadeOut(300);
        $backgroundVideo.show();
    }
});

function showBurgerMenu() {
    $("#hamburgerMenu").fadeIn(300);
}

function hideBurgerMenu () {
    $("#hamburgerMenu").fadeOut(300);
}

function setupVideoCarousel() {
    var $slider = $('#demoVideoContainer');
    var $videos = $('#demoVideoContainer > .demo-video-container');
    var currentIndex = 0;

    var $prevButton = $('#prevButton');
    var $nextButton = $('#nextButton');


    function goToVideo(index) {
        if (index < 0 || index >= $videos.length) return;

        var translateX = `calc(${index * -100}% - ${index}em)`;
        $slider.css('transform', `translateX(${translateX})`);
        $videos.removeClass('active');
        $videos.eq(index).addClass('active');
        currentIndex = index;
        console.log('Current Index:', currentIndex);

        if ($(window).width() >= 641) {
            $prevButton.hide();
            $nextButton.hide();
        } else {
            $prevButton.show();
            $nextButton.show();
            $prevButton.removeClass("primary secondary disabled")
            $nextButton.removeClass("primary secondary disabled")
            if (currentIndex == $videos.length - 1) {
                $prevButton.addClass("primary");
                $nextButton.addClass("disabled");
            } else if (currentIndex == 0) {
                $prevButton.addClass("disabled");
                $nextButton.addClass("primary");
            } else {
                $prevButton.addClass("primary");
                $nextButton.addClass("primary");
            }
        }
    }

    $prevButton.click(function () {
        goToVideo(currentIndex - 1);
        console.log('Previous Button Clicked');
    });

    $nextButton.click(function () {
        goToVideo(currentIndex + 1);
        console.log('Next Button Clicked');
    });

    $(window).resize(function () {
        if ($(window).width() >= 641) {
            goToVideo(0);
            console.log('Window Resized: Desktop View');
        } else {
            goToVideo(0);
            console.log('Window Resized: Mobile View');
        }
    });

    // Initialize on page load
    $(window).trigger('resize');
}
