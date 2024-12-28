
import backendUrl from "./url.js";

let ips =[]; //list to store all the ip addresses fetched from the backend
//----------------- Uploading Files To the Server --------------

// async function uploadFiles() {
//   const statusDiv = document.getElementById('status');
//   const fileInput = document.getElementById('fileInput');
//   const progressContainer = document.getElementById('progress-container');
//   const progressBar = document.getElementById('progress-bar');

//   if (!fileInput.files.length) {
//     alert('Please select at least one file!');
//     return;
//   }

//   const files = fileInput.files;
//   const formData = new FormData();

//   // Append each file to the FormData object
//   for (const file of files) {
//     formData.append('files', file);
//   }

//   // Reset progress bar
//   progressBar.style.width = '0%';
//   progressContainer.style.display = 'block';

//   try {
//     statusDiv.textContent = 'Uploading...';

//     // Use XMLHttpRequest to track upload progress
//     const xhr = new XMLHttpRequest();
//     xhr.open('POST', `${backendUrl}/upload`, true);

//     // Track upload progress
//     xhr.upload.onprogress = (event) => {
//       if (event.lengthComputable) {
//         const percentComplete = Math.round((event.loaded / event.total) * 100);
//         progressBar.style.width = percentComplete + '%';
//         progressBar.textContent = percentComplete + '%';
//       }
//     };

//     xhr.onload = () => {
//       if (xhr.status === 200) {
//         const result = JSON.parse(xhr.responseText);
//         statusDiv.textContent = `Upload successful: ${result.uploaded_files.join(', ')}`;
//       } else {
//         const errorResponse = JSON.parse(xhr.responseText);
//         statusDiv.textContent = `Error: ${errorResponse.error}`;
//       }
//       progressContainer.style.display = 'none';
//     };

//     xhr.onerror = () => {
//       statusDiv.textContent = 'File upload failed.';
//       progressContainer.style.display = 'none';
//     };

//     // Send the form data
//     xhr.send(formData);
//   } catch (error) {
//     console.error('Error uploading files:', error);
//     statusDiv.textContent = 'File upload failed.';
//     progressContainer.style.display = 'none';
//   }
// }

document.querySelector('.upload').addEventListener('click', ()=>{
  uploadFiles()
})


document.querySelector('.close').addEventListener('click', ()=>{
  document.querySelector('.displayBox').style.display = 'none';
})

document.querySelector('.close1').addEventListener('click', ()=>{
  document.querySelector('.displayBox1').style.display = 'none';
})


//----------------- Downloading Files From Server --------------

document.querySelector('.download').addEventListener('click', () => {
  // Show the display box
  const displayBox = document.querySelector('.displayBox');
  displayBox.style.display = 'block';

  // Fetch the list of files from the server
  fetch(`${backendUrl}/list_files`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let innerHTML = '';
     
      // Loop through the files and render the list
      for (let i = 0; i < data.files.length; i++) {
        innerHTML += `
          <div class="listGridDiv">
            <div class="listGridDivUpper">
              <img class="image" src="/static/Pics/file2.png" alt="">
            </div>

            <div class="listGridDivLower">
              <div class="listGridDivLowerLeft">
                <p class="name">${data.files[i]}</p>
              </div>

              <div class="listGridDivLowerRight">
                <button class="fileDownloadButton" data-info="${data.files[i]}">
                  <img src="/static/Pics/download.png" class="downloadButtonImage">
                </button>
              </div>
            </div>
          </div>
        `;
      }
      document.querySelector('.listGrid').innerHTML = innerHTML;

      // Add event listener to download buttons dynamically after file list is populated
      document.querySelectorAll('.fileDownloadButton').forEach(button => {
        button.addEventListener('click', async function () {
          // Extract filename from the button's data-info attribute
          const fileName = this.dataset.info;
          console.log(fileName);

          try {
            // Send a GET request to the download endpoint
            const response = await fetch(`${backendUrl}/download/${fileName}`, {
              method: 'GET',
            });

            if (!response.ok) {
              throw new Error('File download failed');
            }

            // Convert the response into a Blob
            const blob = await response.blob();

            // Create a temporary <a> element for downloading
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName; // Set the filename
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
          } catch (error) {
            console.error('Error downloading the file:', error);
            alert('Failed to download the file.');
          }
        });
      });

    })
    .catch((error) => {
      console.error('Error fetching file list:', error);
    });
});

document.querySelector('.close').addEventListener('click', () => {
  document.querySelector('.displayBox').style.display = 'none';
});


//----------------------------- View Files ----------------------


document.querySelector('.view').addEventListener('click', () => {
  // Show the display box
  const displayBox = document.querySelector('.displayBox');
  displayBox.style.display = 'block';

  // Fetch the list of files from the server
  fetch(`${backendUrl}/list_files`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let innerHTML = '';
      
      // Loop through the files and render the list
      for (let i = 0; i < data.files.length; i++) {
        innerHTML += `
          <div class="listGridDiv">
            <div class="listGridDivUpper">
              <img class="image" src="static/Pics/file2.png" alt="">
            </div>

            <div class="listGridDivLower">
              <div class="listGridDivLowerLeft">
                <p class="name">${data.files[i]}</p>
              </div>
            </div>
          </div>
        `;
      }
      document.querySelector('.listGrid').innerHTML = innerHTML;
    })
    .catch((error) => {
      console.error('Error fetching file list:', error);
    });
});

document.querySelector('.close').addEventListener('click', () => {
  document.querySelector('.displayBox').style.display = 'none';
});


//------------------------- Drag And Drop FUnctionality -----------------------------

const dragDropArea = document.getElementById('dragDropArea');
const fileInput = document.getElementById('fileInput');
const statusDiv = document.getElementById('status');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

let draggedFiles = [];

// Drag-and-Drop Event Listeners
dragDropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dragDropArea.classList.add('drag-over');
});

dragDropArea.addEventListener('dragleave', () => {
  dragDropArea.classList.remove('drag-over');
});

dragDropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dragDropArea.classList.remove('drag-over');
  draggedFiles = e.dataTransfer.files;
  handleFileSelection(draggedFiles);
});

dragDropArea.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  handleFileSelection(fileInput.files);
});

function handleFileSelection(files) {
  if (files.length === 0) {
    alert('Please select at least one file!');
    return;
  }
  draggedFiles = files;
  statusDiv.textContent = `${files.length} file(s) selected. Ready to upload.`;
}

async function uploadFiles() {
  if (!draggedFiles.length) {
    alert('Please select or drag & drop at least one file!');
    return;
  }

  const formData = new FormData();
  for (const file of draggedFiles) {
    formData.append('files', file);
  }

  progressBar.style.width = '0%';
  progressContainer.style.display = 'block';

  try {
    statusDiv.textContent = 'Uploading...';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${backendUrl}/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        progressBar.style.width = percentComplete + '%';
        progressBar.textContent = percentComplete + '%';
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        statusDiv.textContent = `Upload successful`;//${result.uploaded_files.join(', ')}`;
      } else {
        const errorResponse = JSON.parse(xhr.responseText);
        statusDiv.textContent = `Error: ${errorResponse.error}`;
      }
      progressContainer.style.display = 'none';
    };

    xhr.onerror = () => {
      statusDiv.textContent = 'File upload failed.';
      progressContainer.style.display = 'none';
    };

    xhr.send(formData);
  } catch (error) {
    console.error('Error uploading files:', error);
    statusDiv.textContent = 'File upload failed.';
    progressContainer.style.display = 'none';
  }
}

// Attach Upload Event
document.querySelector('.upload').addEventListener('click', uploadFiles);

// Close Display Box
  document.querySelector('.close').addEventListener('click', () => {
  document.querySelector('.displayBox').style.display = 'none';
});

//--------------------------- Show IP Addresses ----------------------------------

// Function to get active IP addresses from the server and display them
async function getAndStoreIPs() {
  // Initialize an empty array to store IP addresses
  let ipArray = [];

  try {
    // Fetch the active IP addresses from the API
    const response = await fetch(`${backendUrl}/scan_network`);

    // Ensure the response is valid
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.active_ips && Array.isArray(data.active_ips)) {
      // Store only the first 10 IPs (if available)
      ipArray = data.active_ips.slice(0, 10);
      console.log('First 10 IP Addresses:', ipArray); // Log the IP array for verification
    } else if (data.error) {
      // Log the error if the backend returns an error
      console.error('Error from backend:', data.error);
    }
  } catch (error) {
    console.error('Error fetching IPs:', error);
  }

  // Return the IP array after fetch completes
  return ipArray;
}


// Call the function when the page loads
document.addEventListener("DOMContentLoaded", async function() {
  ips = await getAndStoreIPs();
  console.log('Fetched IPs:', ips);  // This will log the IPs after the data is fetched
});




// Event listener for showing the IP addresses when a button is clicked
document.querySelector('.seeAddress').addEventListener('click', async () => {
  // Show the display box
  document.querySelector('.displayBox1').style.display = 'block';

  let innerHTML = ``;

  // Fetch the IP addresses
  const ips = await getAndStoreIPs();

  // Clear the container before appending new IPs
  const ipContainer = document.querySelector('.ip');
  ipContainer.innerHTML = '';

  // Append each IP address as a paragraph
  ips.forEach((item) => {
    innerHTML += `<p class="ip">IP Address: ${item}</p>`; 
  });

  //document.querySelector('.loading').style.display = 'none';
  document.querySelector('.listOfIPs').innerHTML = innerHTML;
});
