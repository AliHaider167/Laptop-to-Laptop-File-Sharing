


import backendUrl from "./url.js";

const form = document.getElementById('signup-form');
const message = document.getElementById('message');
const postResponse = document.getElementById('post-response');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Collect form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${backendUrl}/addUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // If the server returns a redirect response
        if (response.redirected) {
            // Redirect the browser to the new location
            window.location.href = response.url; // This will navigate to the 'serve_frontend' route
        } else {
            // Handle the response data (in case of an error or other response)
            const data = await response.json();
            postResponse.innerText = JSON.stringify(data);
        }
    } catch (error) {
        postResponse.innerText = 'Error: ' + error.message;
    }
});