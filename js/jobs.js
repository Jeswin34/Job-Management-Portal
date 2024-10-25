// Handle job posting form submission on post-job.html
const postJobForm = document.getElementById('post-job-form');
if (postJobForm) {
    postJobForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const requirements = document.getElementById('requirements').value.trim();
        const location = document.getElementById('location').value.trim();
        const salary = document.getElementById('salary').value.trim();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login as an employer to post a job');
            window.location.href = 'login.html';
            return;
        }

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ title, description, requirements, location, salary })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Job posted successfully!');
                window.location.href = 'dashboard.html';
            } else {
                alert(data.msg || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            alert('An error occurred while posting the job.');
        }
    });
}
