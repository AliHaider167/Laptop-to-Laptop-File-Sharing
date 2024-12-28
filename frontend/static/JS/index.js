
import backendUrl from "./url.js";
    
// Handle Login Form Submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Clear previous response message
    document.getElementById('login-response').innerText = '';

    if (!username || !password) {
        // Show validation error if fields are empty
        document.getElementById('login-response').innerText = 'Error: Username and password are required.';
        return;
    }

    try {
        // Send login data to the server via GET (using query parameters)
        const response = await fetch(`${backendUrl}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Parse the JSON response
        const data = await response.json();

        if (response.ok) {
            // Display success message and navigate to the provided redirect URL
            document.getElementById('login-response').innerText = data.message;
            if (data.redirect_url) {
                window.location.href = backendUrl + data.redirect_url;
            } else {
                document.getElementById('login-response').innerText = 'Error: No redirect URL provided by the server.';
            }
        } else {
            // Display the error message from the server
            document.getElementById('login-response').innerText = `Error: ${data.message}`;
        }
    } catch (error) {
        // Handle network or unexpected errors
        document.getElementById('login-response').innerText = `Error: ${error.message}`;
    }
});