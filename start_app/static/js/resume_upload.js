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
    window.location.assign("mode_select");
}

function backButton_hidePDFPreview() {
    hidePDFPreview();
}

window.addEventListener("load", (event) => {
    $("#fileInput").val(null);
    $("#backButton").on('click.backPage', backButton_backPage);
    $("#nextButton").on('click', function () {
        window.location.assign("jobs_search");
    });
});


function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

function updateFile(e) {
    preventDefault(e);

    let files = e.dataTransfer.files;
    if(files.length > 0) {
        document.getElementById('fileInput').files = files;
        handleFile(files[0]);
    }
}

function dragEnter(e) {
    preventDefault(e);
    $('#uploadContainer').addClass("dropping");
}

function dragLeave(e) {
    preventDefault(e);
    $('#uploadContainer').removeClass("dropping");
}

$('#fileInput').change(function(e) {
    handleFile(e.target.files[0]);
});

function showPDFPreview() {
    $(".navigation-buttons").fadeOut("fast");
    $("#firstContentContainer").fadeOut("slow", () => {
        let backButton = $("#backButton");
        backButton.off('click.backPage')
        backButton.on('click.hidePDFPreview', backButton_hidePDFPreview);
        backButton.text("Remove");
        
        let nextButton = $("#nextButton");
        nextButton.removeClass("secondary");
        nextButton.addClass("primary");
        nextButton.text("Next");
        
        $(".navigation-buttons").fadeIn("fast");
        $("#secondContentContainer").fadeIn("slow");
    });
}
function hidePDFPreview() {
    $("#uploadContainer").removeClass("dropping");
    $(".navigation-buttons").fadeOut("fast");
    $("#secondContentContainer").fadeOut("slow", () => {

        let backButton = $("#backButton");
        backButton.off('click.hidePDFPreview');
        backButton.on('click.backPage', backButton_backPage);
        backButton.text("Back");
        
        let nextButton = $("#nextButton");
        nextButton.removeClass("primary");
        nextButton.addClass("secondary");
        nextButton.text("Next");
        
        $("#firstContentContainer").fadeIn("slow");
        $(".navigation-buttons").fadeIn("fast");
    });
}

function handleFile(file) {
    if (file.type === 'application/pdf') {
        console.log(file.name + " has been uploaded successfully.");

        let formData = new FormData();
        formData.append('file', file);
        let fileUrl = URL.createObjectURL(file);

        // var { pdfjsLib } = globalThis;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs'; // Set pdfjs worker source path
        pdfjsLib.getDocument(fileUrl).promise.then(function(pdf) {
            pdf.getPage(1).then(function(page) {
                var viewport = page.getViewport({scale: 1});
                $('#pdfViewer').attr("src", fileUrl + "#view=fitH");
                showPDFPreview();
            });
        });

        // AJAX call using jQuery
        $.ajax({
            url: '/upload_pdf',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                // The server has processed the PDF and returned the extracted text
                // console.log("Resume parsed: ", data.resume_text);
                // $('#parsedText').text(data.resume_text);
            },
            error: function(xhr, status, error) {
                alert("Error uploading PDF file.");
                console.error(error);
            }
        });
    } else {
        alert(file.name + " is not a pdf file.");
    }

    $('#fileInput').val('');
}
