// frontend/js/admin.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login as admin');
        window.location.href = 'login.html';
        return;
    }

    // Fetch and display users
    const usersRes = await fetch('/api/auth/users', {
        headers: { 'x-auth-token': token }
    });
    if (!usersRes.ok) {
        console.error('Failed to fetch users:', usersRes.statusText);
        alert('Error fetching users');
    }

    const users = await usersRes.json();
    console.log('Users:', users);

    const usersTable = document.getElementById('users-table').getElementsByTagName('tbody')[0];
    users.forEach(user => {
        const row = usersTable.insertRow();
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.date).toLocaleDateString()}</td>
            <td>
                <button class="delete-btn" data-user-id="${user._id}">Delete</button>
            </td>
        `;
    });

    // Add event listeners to the delete buttons after populating the table
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userId);
            }
        });
    });


    // Fetch and display jobs
    const jobsRes = await fetch('/api/jobs', {
        headers: { 'x-auth-token': token }
    });
    const jobs = await jobsRes.json();
    console.log('Jobs:', jobs);

    const jobsTable = document.getElementById('jobs-table').getElementsByTagName('tbody')[0];
    jobs.forEach(job => {
        const row = jobsTable.insertRow();
        row.innerHTML = `
            <td>${job.title}</td>
            <td>${job.employer.name}</td>
            <td>${new Date(job.datePosted).toLocaleDateString()}</td>
            <td><button class="delete-btn" onclick="deleteJob('${job._id}')">Delete</button></td>
        `;
    });

    // Fetch and display applications
    const applicationsRes = await fetch('/api/applications', {
        headers: { 'x-auth-token': token }
    });
    const applications = await applicationsRes.json();
    console.log('Applications:', applications);

    const applicationsTable = document.getElementById('applications-table').getElementsByTagName('tbody')[0];
    applications.forEach(app => {
        const row = applicationsTable.insertRow();
        row.innerHTML = `
            <td>${app.job.title}</td>
            <td>${app.applicant.name}</td>
            <td><a href="${app.resume}" target="_blank">View Resume</a></td>
            <td>${app.status}</td>
            <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="updateStatus('${app._id}', 'accepted')">Accept</button>
                <button class="action-btn" onclick="updateStatus('${app._id}', 'rejected')">Reject</button>
            </td>
        `;
    });
});

function deleteUser(userId) {
    fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        return response.json();
    })
    .then(data => {
        alert('User deleted successfully');
        fetchUsers();  // Refresh the user list after deletion
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user.');
    });
}


// Delete Job function
async function deleteJob(jobId) {
    // Confirm before deletion
    if (!confirm('Are you sure you want to delete this job?')) {
        return; // Exit if the user cancels
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Unauthorized');
        return;
    }

    const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
    });

    if (res.ok) {
        alert('Job deleted successfully');
        location.reload();
    } else {
        const data = await res.json();
        alert(data.msg || 'Failed to delete job');
    }
}

// Update Application Status function
async function updateStatus(applicationId, status) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Unauthorized');
        return;
    }

    const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ status })
    });

    if (res.ok) {
        alert('Application status updated');
        location.reload();
    } else {
        const data = await res.json();
        alert(data.msg || 'Failed to update status');
    }
}
