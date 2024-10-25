document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const jobId = getJobIdFromURL();

    // Debugging log
    console.log('Job ID from URL:', jobId);


    if (!jobId) {
        alert('Job ID is missing from the URL');
        return;
    }

    await populateJobFields(jobId, token);

    const form = document.getElementById('edit-job-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateJob(jobId, token);
    });
});

// Function to get the Job ID from the URL
function getJobIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('jobId');
}

// Function to populate job fields
async function populateJobFields(jobId, token) {
    try {
        const res = await fetch(`/api/jobs/${jobId}`, {
            headers: { 'x-auth-token': token }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch job data');
        }

        const job = await res.json();
        console.log('Job Data:', job); // Log the fetched job data for debugging

        document.getElementById('job-title').value = job.title || '';
        document.getElementById('job-description').value = job.description || '';
        document.getElementById('job-requirements').value = job.requirements || '';
        document.getElementById('job-location').value = job.location || '';
        document.getElementById('job-salary').value = job.salary || '';
        } catch (error) {
        console.error(error);
        document.getElementById('message-container').innerText = error.message;
    }
}

// Function to update job
async function updateJob(jobId, token) {
    const title = document.getElementById('job-title').value;
    const description = document.getElementById('job-description').value;
    const requirements = document.getElementById('job-requirements').value;
    const location = document.getElementById('job-location').value;
    const salary = document.getElementById('job-salary').value;

    const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ title, description, requirements, location, salary })
    });

    if (res.ok) {
        alert('Job updated successfully!');
        window.location.href = 'dashboard.html'; // Redirect to dashboard
    } else {
        const error = await res.json();
        document.getElementById('message-container').innerText = error.msg || 'Failed to update job';
    }
}
