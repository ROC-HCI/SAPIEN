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


var mode = "community";
var mode_page = "community";

localStorage.setItem('mode', mode);
localStorage.setItem('mode_page', mode_page);

window.addEventListener("load", (event) => {
    $("#startButton").click(function () {
        if (!$(this).hasClass("inoperative")) {
            $.ajax({
                url: '/set_mode_community',
                type: 'POST',
                data: {
                    mode: mode
                },
                success: function (data) {
                    window.location.assign("gallery");
                },
                error: function (xhr, status, error) {
                    alert("Error. Check console for details.");
                    console.error(error);
                }
            });
        }
    });
});
