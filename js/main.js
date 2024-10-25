// Fetch and display jobs on index.html
if (document.getElementById('jobs-container')) {
    fetch('/api/jobs')
        .then(res => res.json())
        .then(jobs => {
            const container = document.getElementById('jobs-container');
            if (jobs.length === 0) {
                container.innerHTML = '<p>No jobs available at the moment.</p>';
                return;
            }
            jobs.forEach(job => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job');
                jobDiv.innerHTML = `
                    <h3>${job.title}</h3>
                    <p>${job.description}</p>
                    <p><strong>Location:</strong> ${job.location || 'N/A'}</p>
                    <p><strong>Salary:</strong> ${job.salary || 'N/A'}</p>
                    <p><strong>Employer:</strong> ${job.employer.name}</p>
                    <button onclick="applyForJob('${job._id}')">Apply</button>
                `;
                container.appendChild(jobDiv);
            });
        })
        .catch(err => console.error(err));
}

// Handle Apply for Job
function applyForJob(jobId) {
    const token = localStorage.getItem('token');

    if (!token) {
        // If the user is not logged in, show alert and redirect to login page
        alert('Please login to apply for jobs.');
        window.location.href = 'login.html';
        return;
    }

    // Redirect to apply-job.html with jobId as query parameter
    window.location.href = `apply-job.html?jobId=${jobId}`;
}

// Handle application form submission on apply-job.html
const applyJobForm = document.getElementById('apply-job-form');
if (applyJobForm) {
    // Extract jobId from URL
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('jobId');
    if (jobId) {
        document.getElementById('jobId').value = jobId;
    } else {
        alert('Invalid job ID');
        window.location.href = 'index.html';
    }

    applyJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const jobId = document.getElementById('jobId').value;
        const resumeFile = document.getElementById('resume').files[0]; // Get the file
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please login to apply');
            window.location.href = 'login.html';
            return;
        }

        const formData = new FormData();
        formData.append('jobId', jobId);
        formData.append('resume', resumeFile); // Add the file to the form data

        const submitButton = applyJobForm.querySelector('button[type="submit"]');
        submitButton.disabled = true; // Disable the button to prevent multiple submissions

        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'x-auth-token': token
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                alert('Application submitted successfully!');
                applyJobForm.reset(); // Clear the form
                window.location.href = 'dashboard.html';
            } else if (res.status === 400 && data.msg === 'Already applied for this job') {
                // Handle "Already applied" message specifically
                alert('You have already applied for this job.');
                window.location.href = 'dashboard.html'; // Redirect to dashboard if already applied
            } else {
                alert(data.msg || 'Failed to submit application');
                submitButton.disabled = false; // Re-enable the button if submission fails
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('An error occurred while submitting your application.');
            submitButton.disabled = false; // Re-enable the button
        }
    });
}

// Dashboard functionalities
if (document.getElementById('dashboard.html')) {
    // Fetch user info and display
}

const logoutLink = document.getElementById('logout');
if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
}
