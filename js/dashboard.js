// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login');
        window.location.href = 'login.html';
        return;
    }

    // Fetch user info
    const userRes = await fetch('/api/auth/user', {
        headers: { 'x-auth-token': token }
    });

    if (!userRes.ok) {
        alert('Failed to fetch user data');
        return;
    }

    // Inside your fetchUser function, where you handle the fetched user data
    const user = await userRes.json();
    localStorage.setItem('userId', user._id); // Store user ID

    // Display user info dynamically
    document.getElementById('user-name').textContent = user.name; // Update user name
    document.getElementById('user-email').textContent = user.email; // Update user email

    // Check user role and load content accordingly
    if (user.role === 'admin') {
        window.location.href = 'admin.html'; // Redirect to admin dashboard
    } else if (user.role === 'employer') {
        fetchEmployerJobs(user._id, token);
    } else {
        fetchJobListings(token);
        fetchJobSeekerApplications(user._id, token); // Fetch applications for job seekers
    }
});

// Fetch job seeker applications
async function fetchJobSeekerApplications(userId, token) {
    try {
        const res = await fetch(`/api/applications?userId=${userId}`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            alert('Failed to fetch applications. Please try again later.');
            return;
        }

        const applications = await res.json();
        const jobActionsDiv = document.getElementById('job-actions');
        jobActionsDiv.innerHTML += '<h3>Your Applications</h3>'; // Add a header for applications

        if (applications.length === 0) {
            jobActionsDiv.innerHTML += '<p>You have not applied for any jobs yet.</p>';
            return;
        }

        applications.forEach(app => {
            const appDiv = document.createElement('div');
            appDiv.classList.add('application');

            const jobTitle = app.job ? app.job.title : 'Job not found'; // Use fallback if job is null
            appDiv.innerHTML = `
                <h4>Job Title: ${jobTitle}</h4>
                <p>Status: <span id="status-${app._id}">${app.status}</span></p>
                <p>Date Applied: ${new Date(app.dateApplied).toLocaleDateString()}</p>
                <button onclick="withdrawApplication('${app._id}', '${token}')">Withdraw Application</button>
            `;
            jobActionsDiv.appendChild(appDiv);
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        alert('An error occurred while fetching applications. Please try again.');
    }
}

// Withdraw an application
async function withdrawApplication(applicationId, token) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
        const res = await fetch(`/api/jobs/applications/${applicationId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            const errorMessage = await res.text(); // Get the error message from the response
            throw new Error(`Error withdrawing application: ${errorMessage}`);
        }

        alert('Application withdrawn successfully.');
        window.location.href = 'dashboard.html';
        // Refresh the applications list
        // const userId = localStorage.getItem('userId');
        // fetchJobSeekerApplications(userId, token);
    } catch (error) {
        console.error('Error withdrawing application:', error);
        alert('An error occurred while withdrawing the application. Please try again.');
    }
}

// Fetch job listings for job seekers
async function fetchJobListings(token) {
    try {
        const res = await fetch('/api/jobs', {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            alert('Failed to fetch jobs. Please try again later.');
            return;
        }

        const jobs = await res.json();
        const jobActionsDiv = document.getElementById('job-actions');
        jobActionsDiv.innerHTML += '<h3>Available Jobs</h3>'; // Add a header for job listings

        if (jobs.length === 0) {
            jobActionsDiv.innerHTML += '<p>No jobs available at the moment.</p>';
            return;
        }

        jobs.forEach(job => {
            const jobDiv = document.createElement('div');
            jobDiv.classList.add('job');
            jobDiv.innerHTML = `
                <h4>${job.title}</h4>
                <p>${job.description}</p>
                <p><strong>Location:</strong> ${job.location || 'N/A'}</p>
                <p><strong>Salary:</strong> ${job.salary || 'N/A'}</p>
                <button onclick="applyForJob('${job._id}', '${token}')">Apply</button>
            `;
            jobActionsDiv.appendChild(jobDiv);
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        alert('An error occurred while fetching jobs. Please try again.');
    }
}

// Apply for a job
// async function applyForJob(jobId, token) {
//     try {
//         const res = await fetch(`/api/applications`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-auth-token': token
//             },
//             body: JSON.stringify({ jobId })
//         });

//         if (res.ok) {
//             // Redirect to apply-job.html with jobId as query parameter
//             window.location.href = `apply-job.html?jobId=${jobId}`;
//             // alert('Application submitted successfully!');
//             // Refresh the applications list
//             const userId = localStorage.getItem('userId');
//             fetchJobSeekerApplications(userId, token);
//         } else {
//             alert('Failed to apply for job.');
//         }
//     } catch (error) {
//         console.error('Error applying for job:', error);
//         alert('An error occurred while applying for the job. Please try again.');
//     }
// }

// Fetch applications for the employer
async function fetchApplicationsForEmployer(jobId, token) {
    localStorage.setItem('currentJobId', jobId);
    console.log(`Fetching applications for job ID: ${jobId}`);

    const jobActionsDiv = document.getElementById('job-actions');
    jobActionsDiv.innerHTML = '<p>Loading applications...</p>'; // Show loading message

    // Create and append the back button immediately
    const backButton = document.createElement('button');
    backButton.innerText = 'Back to Jobs';
    backButton.onclick = () => {
        fetchEmployerJobs(localStorage.getItem('userId'), token);
    };
    jobActionsDiv.appendChild(backButton); // Append button immediately

    try {
        const res = await fetch(`/api/applications?jobId=${jobId}`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            alert('Failed to fetch applications. Please try again later.');
            return;
        }

        const applications = await res.json();
        console.log('Fetched applications:', applications);

        // Clear previous content to update with new applications
        jobActionsDiv.innerHTML = '';

        if (applications.length === 0) {
            jobActionsDiv.innerHTML += '<p>No applications for this job yet.</p>';
        }
        jobActionsDiv.appendChild(backButton); // Re-add back button after clearing

        // Render each application with details
        applications.forEach(app => {
            const appDiv = document.createElement('div');
            appDiv.classList.add('application');
            appDiv.innerHTML = `
                <h4>Applicant: ${app.applicant.name}</h4>
                <p>Status: <span id="status-${app._id}">${app.status}</span></p>
                <p>Date Applied: ${new Date(app.dateApplied).toLocaleDateString()}</p>
                <p><a href="${app.resume}" target="_blank">View Resume</a></p> <!-- Link to view resume -->
                <div>
                    <button onclick="changeApplicationStatus('${app._id}', 'applied', '${token}')">Applied</button>
                    <button onclick="changeApplicationStatus('${app._id}', 'under review', '${token}')">Under Review</button>
                    <button onclick="changeApplicationStatus('${app._id}', 'interview', '${token}')">Interview</button>
                    <button onclick="changeApplicationStatus('${app._id}', 'rejected', '${token}')">Rejected</button>
                    <button onclick="changeApplicationStatus('${app._id}', 'accepted', '${token}')">Accepted</button>
                </div>
            `;
            jobActionsDiv.appendChild(appDiv);
        });
    } catch (error) {
        console.error('Error fetching applications for job:', error);
        alert('An error occurred while fetching applications. Please try again.');
    }
}




// Function to fetch jobs for the employer
async function fetchEmployerJobs(employerId, token) {
    try {
        const res = await fetch('/api/jobs', {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            alert('Failed to fetch jobs. Please try again later.');
            return;
        }

        const jobs = await res.json();
        const jobActionsDiv = document.getElementById('job-actions');
        jobActionsDiv.innerHTML = `<button onclick="window.location.href='post-job.html'">Post a New Job</button>
        <h3>Your Posted Jobs</h3>`; // Add a header for employer jobs

        const employerJobs = jobs.filter(job => job.employer._id === employerId);

        if (employerJobs.length === 0) {
            jobActionsDiv.innerHTML += '<p>You have not posted any jobs yet.</p>';
            return;
        }

        // Render each job with details
        employerJobs.forEach(job => {
            const jobDiv = document.createElement('div');
            jobDiv.classList.add('job');
            jobDiv.innerHTML = `
                <h4>${job.title}</h4>
                <p>${job.description}</p>
                <p><strong>Location:</strong> ${job.location || 'N/A'}</p>
                <p><strong>Salary:</strong> ${job.salary || 'N/A'}</p>
                <button onclick="editJob('${job._id}')">Edit</button>
                <button onclick="deleteJob('${job._id}', '${token}')">Delete</button>
                <button onclick="fetchApplicationsForEmployer('${job._id}', '${token}')">View Applications</button>
            `;
            jobActionsDiv.appendChild(jobDiv);
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        alert('An error occurred while fetching jobs. Please try again.');
    }
}

// Function to change application status
async function changeApplicationStatus(applicationId, newStatus, token) {
    if (!newStatus) return; // Cancel if no input

    try {
        const res = await fetch(`/api/applications/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            alert('Failed to change application status. Please try again later.');
            return;
        }

        // Update the status in the UI
        document.getElementById(`status-${applicationId}`).innerText = newStatus;
        alert('Application status updated successfully!');
    } catch (error) {
        console.error('Error changing application status:', error);
        alert('An error occurred while updating the application status. Please try again.');
    }
}


// Edit a job (employer)
function editJob(jobId) {
    // Redirect to edit job page with the jobId as a query parameter
    window.location.href = `edit-job.html?jobId=${jobId}`;
}

// Delete a job
async function deleteJob(jobId, token) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
        const res = await fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (res.ok) {
            alert('Job deleted successfully.');
            const employerId = localStorage.getItem('userId');
            fetchEmployerJobs(employerId, token); // Refresh job list
        } else {
            alert('Failed to delete job.');
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('An error occurred while deleting the job. Please try again.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentJobId'); // Clear current job ID on logout
    window.location.href = 'login.html'; // Redirect to login page
}
