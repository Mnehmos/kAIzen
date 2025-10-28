import { subscribeEmail, getNewsletterIssues, getTechniques } from './supabase-client.js';

// Load latest newsletter issues for homepage
async function loadLatestIssues() {
    const container = document.getElementById('latest-issues');
    if (!container) return;

    const { data: issues, error } = await getNewsletterIssues(3);

    if (error || !issues) {
        container.innerHTML = '<p class="error">Unable to load newsletter issues. Please try again later.</p>';
        return;
    }

    if (issues.length === 0) {
        container.innerHTML = '<p>No newsletter issues available yet.</p>';
        return;
    }

    container.innerHTML = issues.map(issue => createNewsletterCard(issue)).join('');
}

// Load featured techniques for homepage
async function loadFeaturedTechniques() {
    const container = document.getElementById('featured-techniques');
    if (!container) return;

    const { data: techniques, error } = await getTechniques();

    if (error || !techniques) {
        container.innerHTML = '<p class="error">Unable to load techniques. Please try again later.</p>';
        return;
    }

    if (techniques.length === 0) {
        container.innerHTML = '<p>No techniques available yet.</p>';
        return;
    }

    // Show first 3 techniques
    const featured = techniques.slice(0, 3);
    container.innerHTML = featured.map(technique => createTechniqueCard(technique)).join('');
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

// View newsletter (placeholder - would open modal with full content)
window.viewNewsletter = function(id) {
    // For now, redirect to newsletter page
    window.location.href = `newsletter.html?id=${id}`;
};

// View technique (placeholder - would open modal with full content)
window.viewTechnique = function(id) {
    // For now, redirect to techniques page
    window.location.href = `techniques.html?id=${id}`;
};

// Handle subscribe form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('subscribe-form');
    const emailInput = document.getElementById('email-input');
    const messageDiv = document.getElementById('subscribe-message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email) return;

            // Disable form
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            // Clear previous messages
            messageDiv.innerHTML = '';

            // Subscribe
            const result = await subscribeEmail(email);

            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe Free';

            if (result.success) {
                messageDiv.innerHTML = '✓ Success! Check your email to confirm your subscription.';
                messageDiv.className = 'form-message success';
                form.reset();
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    closeSubscribeModal();
                }, 2000);
            } else {
                messageDiv.innerHTML = `✗ ${result.error}`;
                messageDiv.className = 'form-message error';
            }
        });
    }

    // Load content
    loadLatestIssues();
    loadFeaturedTechniques();
});