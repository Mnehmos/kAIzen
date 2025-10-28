import { subscribeEmail, getNewsletterIssues, getNewsletterIssue } from './supabase-client.js';

// Load all newsletter issues
async function loadNewsletterArchive() {
    const container = document.getElementById('newsletter-list');
    if (!container) return;

    const { data: issues, error } = await getNewsletterIssues();

    if (error || !issues) {
        container.innerHTML = '<p class="error">Unable to load newsletter archive. Please try again later.</p>';
        return;
    }

    if (issues.length === 0) {
        container.innerHTML = '<p>No newsletter issues available yet. Check back soon!</p>';
        return;
    }

    container.innerHTML = issues.map(issue => createNewsletterCard(issue)).join('');
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
    const clickHandler = issue.tier_required === 'pro' 
        ? 'onclick="showUpgradePrompt()"'
        : `onclick="viewNewsletterDetail('${issue.id}')"`;

    const techniques = issue.technique_ids && issue.technique_ids.length > 0
        ? issue.technique_ids.map(id => `<span class="tag">${id}</span>`).join('')
        : '';

    return `
        <div class="newsletter-card ${lockedClass}" ${clickHandler}>
            <div class="newsletter-header">
                <h3 class="newsletter-title">${issue.title}</h3>
                <div class="newsletter-meta">
                    <span>📅 ${date}</span>
                    <span>•</span>
                    <span>📮 ${issue.issue_number}</span>
                </div>
            </div>
            <p class="newsletter-summary">${issue.summary || 'Click to read more...'}</p>
            <div class="newsletter-tags">
                ${tierBadge}
                ${techniques}
            </div>
        </div>
    `;
}

// View newsletter detail in modal
window.viewNewsletterDetail = async function(id) {
    const modal = document.getElementById('newsletter-modal');
    const detailContainer = document.getElementById('newsletter-detail');
    
    if (!modal || !detailContainer) return;

    // Show modal with loading state
    detailContainer.innerHTML = '<div class="loading">Loading newsletter...</div>';
    openNewsletterModal();

    // Fetch full newsletter
    const { data: issue, error } = await getNewsletterIssue(id);

    if (error || !issue) {
        detailContainer.innerHTML = '<p class="error">Unable to load newsletter. Please try again.</p>';
        return;
    }

    // Format date
    const date = new Date(issue.publish_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Render full newsletter
    detailContainer.innerHTML = `
        <div class="newsletter-detail">
            <div class="newsletter-header">
                <h2>${issue.title}</h2>
                <div class="newsletter-meta">
                    <span>📅 ${date}</span>
                    <span>•</span>
                    <span>📮 ${issue.issue_number}</span>
                </div>
            </div>
            <div class="markdown-content">
                ${renderMarkdown(issue.content_md)}
            </div>
        </div>
    `;
};

// Show upgrade prompt for pro content
window.showUpgradePrompt = function() {
    const confirmed = confirm('This newsletter issue is available for Pro subscribers only. Would you like to upgrade to Pro for $19/month?');
    if (confirmed) {
        window.location.href = 'pricing.html';
    }
};

// Simple markdown renderer (basic implementation)
function renderMarkdown(markdown) {
    if (!markdown) return '';

    // This is a very basic markdown renderer
    // For production, consider using a library like marked.js
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>');

    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (para.trim() && !para.startsWith('<') && !para.includes('</')) {
            return `<p>${para.trim()}</p>`;
        }
        return para;
    }).join('\n');

    return html;
}

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

    // Load newsletter archive
    loadNewsletterArchive();

    // Check for issue ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get('id');
    if (issueId) {
        viewNewsletterDetail(issueId);
    }
});