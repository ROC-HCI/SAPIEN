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


function addAccessCode(event) {
  event.preventDefault();
  
  let accessCode = $('#accessCode').val();
  let assignedTo = $('#assignedTo').val();
  let remainingUsage = $('#remainingUsage').val();

  let formData = {
      'access_code': accessCode,
      'assigned_to': assignedTo,
      'remaining_usage': remainingUsage
  };

  fetch('/add_access_code', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

$(document).ready(function () {
  addSortEventListeners();

  $("#addAccessCodeForm").on('submit', addAccessCode);

  $('#toggleHideDeletedUsers').change(function (event) {
    if (event.target.checked) {
      console.log('hiding deleted users');
      $("body").get(0).style.setProperty('--deletedUserDisplay', 'none');
    } else {
      console.log('showing deleted users');
      $("body").get(0).style.setProperty('--deletedUserDisplay', 'table-row');
    }
  });

  $("#initServerButton").click(() => {
    if (confirm("Reset all instances and Waitlist?")) {
      window.location.href = "/init_server"
    }
  })

  $("#terminateAppButton").click(() => {
    if (confirm("Are you sure you want to terminate?")) {
      fetch('/terminate', {
        method: 'POST',
      })
    }
  });
});

// SORTING
function addSortEventListeners() {
  // Get all the table headers
  var headers = $('th');

  // Add click event listeners to each header
  headers.click(function () {
    var table = $(this).closest('table');
    var tbody = table.find('tbody');
    var rows = tbody.find('tr').toArray();
    var headerIndex = $(this).siblings().addBack().index(this);

    // Determine if the table is currently sorted in ascending or descending order
    var isAscending = $(this).hasClass('ascending');
    var isDescending = $(this).hasClass('descending');

    // Remove the sorting classes from all headers
    headers.removeClass('ascending descending');

    // Sort the rows based on the clicked header
    rows.sort(function (row1, row2) {
      var cell1 = row1.children[headerIndex].textContent;
      var cell2 = row2.children[headerIndex].textContent;

      // Compare the numbers numerically for the "Remaining Usage" column
      if (headerIndex === 2) {
        return Number(cell1) - Number(cell2);
      }
      // Parse the dates for the "Last Used" column and compare them
      else if (headerIndex === 3) {
        // Handle blank values in the date fields
        if (cell1 === '' && cell2 === '') {
          return 0;
        }
        else if (cell1 === '' || cell2 === '') {
          if (isAscending) {
            return cell1 ? 1 : -1;
          }
          return cell1 ? -1 : 1;
        }

        var date1 = new Date(cell1).getTime();
        var date2 = new Date(cell2).getTime();
        return date1 - date2;
      }
      // Handle blank values in the "Assigned To" column
      else if (headerIndex === 1) {
        if (cell1 === '' && cell2 === '') {
          return 0;
        }
        if (cell1 === '' || cell2 === '') {
          if (isAscending) {
            return cell1 ? 1 : -1;
          }
          return cell1 ? -1 : 1;
        }
      }

      return cell1.localeCompare(cell2);
    });

    // Reverse the order if already sorted in ascending order
    if (isAscending) {
      rows.reverse();
      $(this).addClass('descending');
    } else {
      $(this).addClass('ascending');
    }

    // Remove existing rows from the table
    tbody.empty();

    // Append the sorted rows to the table
    $.each(rows, function (i, row) {
      tbody.append(row);
    });
  });
}
