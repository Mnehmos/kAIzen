// Home page functionality for kAIzen Systems

// Wait for Supabase to be initialized
document.addEventListener('DOMContentLoaded', async function() {
    // Wait a bit for Supabase to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadLatestIssues();
    loadFeaturedTechniques();
    setupSubscribeForm();
});

// Load latest newsletter issues for homepage
async function loadLatestIssues() {
    const container = document.getElementById('latest-issues');
    if (!container) return;
    
    const client = window.getKaizenSupabase();
    if (!client) {
        container.innerHTML = '<p class="error">Database connection not available. Please refresh the page.</p>';
        return;
    }

    try {
        const { data: issues, error } = await client
            .from('newsletter_issues')
            .select('*')
            .order('publish_date', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Error fetching newsletter issues:', error);
            container.innerHTML = '<p class="error">Unable to load newsletter issues.</p>';
            return;
        }

        if (!issues || issues.length === 0) {
            container.innerHTML = '<p>No newsletter issues available yet.</p>';
            return;
        }

        container.innerHTML = issues.map(issue => createNewsletterCard(issue)).join('');
    } catch (err) {
        console.error('Error loading issues:', err);
        container.innerHTML = '<p class="error">Unable to load newsletter issues.</p>';
    }
}

// Load featured techniques for homepage
async function loadFeaturedTechniques() {
    const container = document.getElementById('featured-techniques');
    if (!container) return;
    
    const client = window.getKaizenSupabase();
    if (!client) {
        container.innerHTML = '<p class="error">Database connection not available. Please refresh the page.</p>';
        return;
    }

    try {
        const { data: techniques, error } = await client
            .from('techniques')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Error fetching techniques:', error);
            container.innerHTML = '<p class="error">Unable to load techniques.</p>';
            return;
        }

        if (!techniques || techniques.length === 0) {
            container.innerHTML = '<p>No techniques available yet.</p>';
            return;
        }

        container.innerHTML = techniques.map(technique => createTechniqueCard(technique)).join('');
    } catch (err) {
        console.error('Error loading techniques:', err);
        container.innerHTML = '<p class="error">Unable to load techniques.</p>';
    }
}

// Create newsletter card HTML
function createNewsletterCard(issue) {
    const date = new Date(issue.publish_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const tierBadge = issue.tier_required === 'pro' 
        ? '<span class="tag tier-pro">Pro</span>'
        : '<span class="tag tier-free">Free</span>';

    const lockedClass = issue.tier_required === 'pro' ? 'locked' : '';

    return `
        <div class="newsletter-card ${lockedClass}" onclick="viewNewsletter('${issue.id}')">
            <div class="newsletter-header">
                <h3 class="newsletter-title">${issue.title}</h3>
                <div class="newsletter-meta">
                    <span>${date}</span>
                    <span>•</span>
                    <span>${issue.issue_number}</span>
                </div>
            </div>
            <p class="newsletter-summary">${issue.summary || 'Read this issue to learn more...'}</p>
            <div class="newsletter-tags">
                ${tierBadge}
            </div>
        </div>
    `;
}

// Create technique card HTML
function createTechniqueCard(technique) {
    const tierBadge = technique.tier_required === 'pro'
        ? '<span class="tag tier-pro">Pro</span>'
        : '<span class="tag tier-free">Free</span>';

    const lockedClass = technique.tier_required === 'pro' ? 'locked' : '';

    return `
        <div class="technique-card ${lockedClass}" onclick="viewTechnique('${technique.id}')">
            <div class="technique-header">
                <div>
                    <h3 class="technique-title">${technique.name}</h3>
                    <div class="technique-version">${technique.version}</div>
                </div>
                <span class="technique-category">${technique.category}</span>
            </div>
            <p class="technique-summary">${technique.summary}</p>
            <div class="newsletter-tags">
                ${tierBadge}
            </div>
        </div>
    `;
}

// View newsletter (redirect to newsletter page)
window.viewNewsletter = function(id) {
    window.location.href = `newsletter.html?id=${id}`;
};

// View technique (redirect to techniques page)
window.viewTechnique = function(id) {
    window.location.href = `techniques.html?id=${id}`;
};

// Setup subscribe form
function setupSubscribeForm() {
    const form = document.getElementById('subscribe-form');
    const emailInput = document.getElementById('email-input');
    const messageDiv = document.getElementById('subscribe-message');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        const client = window.getKaizenSupabase();
        if (!client) {
            messageDiv.innerHTML = '✗ Database connection not available';
            messageDiv.className = 'form-message error';
            return;
        }

        // Disable form
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        messageDiv.innerHTML = '';

        try {
            const { data, error } = await client
                .from('subscribers')
                .insert([{ 
                    email: email, 
                    tier: 'free',
                    subscribed_at: new Date().toISOString()
                }])
                .select();

            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe Free';

            if (error) {
                if (error.code === '23505') {
                    messageDiv.innerHTML = '✗ This email is already subscribed!';
                } else {
                    console.error('Subscription error:', error);
                    messageDiv.innerHTML = '✗ Failed to subscribe. Please try again.';
                }
                messageDiv.className = 'form-message error';
            } else {
                messageDiv.innerHTML = '✓ Success! Check your email to confirm your subscription.';
                messageDiv.className = 'form-message success';
                form.reset();
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    closeSubscribeModal();
                }, 2000);
            }
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe Free';
            console.error('Subscription error:', err);
            messageDiv.innerHTML = '✗ An unexpected error occurred.';
            messageDiv.className = 'form-message error';
        }
    });
}