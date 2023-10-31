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


let $accountImage;
let $accountPopup;

function showAccountPopup() {
  $accountImage.off('click.showAccountPopup');
  $accountImage.on('click.hideAccountPopup', hideAccountPopup);
  $accountPopup.fadeIn(150);
}
function hideAccountPopup() {
  $accountImage.off('click.hideAccountPopup');
  $accountImage.on('click.showAccountPopup', showAccountPopup);
  $accountPopup.fadeOut(150);
}

$(document).ready(() => {
  $('body').prepend($(`
    <style>
      #accountMenu {
        position: absolute;
        top: 0;
        right: 0;
        margin: 1rem;
        display: flex;
        flex-direction: column;
        align-items: right;
      }
      #accountMenu img {
          margin-left: auto;
          width: 50px;
          border-radius: 100px;
          z-index: 9999 !important;
          outline: 5px solid transparent;
          transition: outline 200ms;
      }
      #accountMenu img:hover {
          outline: 5px solid lightgray;
      }
      #accountPopup {
          display: none;
          margin: 1rem 0;
          padding: 1em 1em;
          border-radius: 20px;
          background-color: var(--box-background-color);
          border: var(--box-border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 400 !important;
      }

      :root {
        --sunDisplay: flex;
        --moonDisplay: none;
      }
      :root .dark {
        --sunDisplay: none;
        --moonDisplay: flex;
      }

      #sun {
        display: var(--sunDisplay);
      }
      #moon {
        display: var(--moonDisplay);
      }

      /* The switch - the box around the slider */
      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
        margin: 0;
      }
      .switch::before {
        padding: 0;
        margin-left: 75px;
        font-size: 1.5rem;
      }

      /* Hide default HTML checkbox */
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      /* The slider */
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
      }

      .slider:before {
        position: absolute;
        content: '';
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: var(--text-color-light);
        -webkit-transition: .4s;
        transition: .4s;
      }
      .slider:before {
        background-color: var(--box-background-color);
      }

      input:checked + .slider {
        background-color: var(--highlight-color);
      }

      input:focus + .slider {
        // box-shadow: 0 0 1px var(--highlight-color);
      }

      input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
      }

      /* Rounded sliders */
      .slider.round {
        border-radius: 34px;
      }

      .slider.round:before {
        border-radius: 50%;
      }
    </style>
    <div id="accountMenu">
      <img id="accountImage" src="${$("#accountMenuScript").attr("user_image")}" draggable="false">
      <div id="accountPopup">
        <div class="flex flex-col gap-1em">
          <p class="font-bold">${$("#accountMenuScript").attr("user_name")}</p>
          <div class="flex justify-space-between">
            <svg id="sun" class="svg-text-dark text-icon" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M256 118a22 22 0 01-22-22V48a22 22 0 0144 0v48a22 22 0 01-22 22zM256 486a22 22 0 01-22-22v-48a22 22 0 0144 0v48a22 22 0 01-22 22zM369.14 164.86a22 22 0 01-15.56-37.55l33.94-33.94a22 22 0 0131.11 31.11l-33.94 33.94a21.93 21.93 0 01-15.55 6.44zM108.92 425.08a22 22 0 01-15.55-37.56l33.94-33.94a22 22 0 1131.11 31.11l-33.94 33.94a21.94 21.94 0 01-15.56 6.45zM464 278h-48a22 22 0 010-44h48a22 22 0 010 44zM96 278H48a22 22 0 010-44h48a22 22 0 010 44zM403.08 425.08a21.94 21.94 0 01-15.56-6.45l-33.94-33.94a22 22 0 0131.11-31.11l33.94 33.94a22 22 0 01-15.55 37.56zM142.86 164.86a21.89 21.89 0 01-15.55-6.44l-33.94-33.94a22 22 0 0131.11-31.11l33.94 33.94a22 22 0 01-15.56 37.55zM256 358a102 102 0 11102-102 102.12 102.12 0 01-102 102z"/></svg>
            <svg id="moon" class="svg-text-dark text-icon" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M264 480A232 232 0 0132 248c0-94 54-178.28 137.61-214.67a16 16 0 0121.06 21.06C181.07 76.43 176 104.66 176 136c0 110.28 89.72 200 200 200 31.34 0 59.57-5.07 81.61-14.67a16 16 0 0121.06 21.06C442.28 426 358 480 264 480z"/></svg>
            <label class="switch">
              <input id="colorModeToggle" type="checkbox" ${$("#accountMenuScript").attr("color_mode") === "dark" ? "checked" : ""}>
              <span class="slider round"></span>
            </label>
          </div>
          <button id="signOutButton" class="primary">Sign Out</button>
        </div>
      </div>
    </div>
  `));

  $accountImage = $("#accountImage");
  $accountPopup = $("#accountPopup");

  $accountImage.on('click.showAccountPopup', showAccountPopup);

  $("#signOutButton").click(() => {
    console.log(window.location);
    window.location = "/logout";
  });

  $("#colorModeToggle").change(function () {
    let newMode;
    if ($(this).attr('checked') === undefined) {
      $(this).attr('checked', '');
      $('body').addClass('dark');
      newMode="dark";
    } else {
      $(this).removeAttr('checked');
      $('body').removeClass('dark');
      newMode="light";
    }

    fetch('/set_color_mode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        color_mode: newMode,
      }),
    });
  });

  const restartButton = document.getElementById('restartButton');
  const homeButton = document.getElementById('homeButton');
  restartButton.addEventListener('click', () => {
    window.location.href = localStorage.getItem('mode_page')
  });
  homeButton.addEventListener('click', () => {
    window.location.href = '/mode_select';
  });
});