document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const logoutContainer = document.getElementById('logout-container');

    // Show the logout link if the user is logged in
    if (token) {
        logoutContainer.style.display = 'inline'; // Show the Logout link
    }

    // Logout functionality
    const logoutLink = document.getElementById('logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            localStorage.removeItem('token'); // Remove the token
            window.location.href = 'login.html'; // Redirect to login page
        });
    }
});
