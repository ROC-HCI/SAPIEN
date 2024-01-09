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


const modePageMap = {
    "community": "community",
    "interview": "resume_upload",
    "learning": "enter_topic",
    "language": "enter_language",
    "dating": "gallery",
    "custom": "custom",
    "ptsd": "ptsd",
}

window.addEventListener("load", (event) => {
    $(".mode-select-button-container").click(function () {
        if (!$(this).hasClass("inoperative")) {
            let selectedMode = $(this).children('.mode-select-button').attr('id');
            localStorage.setItem('mode', selectedMode);
            localStorage.setItem('mode_page', modePageMap[selectedMode]);

            $.ajax({
        url: '/mode_select',
        type: 'POST',
        data: {
            mode: selectedMode
        },
        success: function(data) {
            window.location.assign(modePageMap[selectedMode]);
        },
        error: function(xhr, status, error) {
            alert("Error. Check console for details.");
            console.error(error);
        }
    });
        }
    });
});
