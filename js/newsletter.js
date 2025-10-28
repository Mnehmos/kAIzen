// Newsletter page functionality for kAIzen Systems

// Wait for page to load
document.addEventListener('DOMContentLoaded', async function() {
    // Wait a bit for Supabase to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadNewsletterArchive();
    setupSubscribeForm();
});

// Load all newsletter issues
async function loadNewsletterArchive() {
    const container = document.getElementById('newsletter-list');
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
            .order('publish_date', { ascending: false });

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
        console.error('Error loading newsletter:', err);
        container.innerHTML = '<p class="error">Unable to load newsletter issues.</p>';
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
        ? '<span class="tag tier-pro">Pro Only</span>'
        : '<span class="tag tier-free">Free</span>';

    const lockedClass = issue.tier_required === 'pro' ? 'locked' : '';

    return `
        <div class="newsletter-card ${lockedClass}" onclick="viewNewsletterDetail('${issue.id}')">
            <div class="newsletter-header">
                <h3 class="newsletter-title">${issue.title}</h3>
                <div class="newsletter-meta">
                    <span>${date}</span>
                    <span>•</span>
                    <span>${issue.issue_number}</span>
                </div>
            </div>
            <p class="newsletter-summary">${issue.summary || 'Click to read more...'}</p>
            <div class="newsletter-footer">
                <div class="newsletter-tags">
                    ${tierBadge}
                </div>
                <div class="newsletter-action">
                    ${issue.tier_required === 'pro' ? '🔒 Pro Required' : 'Read Article →'}
                </div>
            </div>
        </div>
    `;
}

// View newsletter detail
window.viewNewsletterDetail = async function(id) {
    const modal = document.getElementById('newsletter-modal');
    const detailDiv = document.getElementById('newsletter-detail');
    
    if (!modal || !detailDiv) return;
    
    const client = window.getKaizenSupabase();
    if (!client) {
        alert('Database connection not available');
        return;
    }

    try {
        const { data: issue, error } = await client
            .from('newsletter_issues')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !issue) {
            console.error('Error fetching newsletter:', error);
            alert('Unable to load newsletter issue');
            return;
        }

        // Check if Pro content and user is not Pro
        if (issue.tier_required === 'pro') {
            detailDiv.innerHTML = `
                <div class="pro-required">
                    <h2>🔒 Pro Content</h2>
                    <p>This newsletter issue is available to Pro subscribers only.</p>
                    <a href="pricing.html" class="btn btn-primary">Upgrade to Pro</a>
                </div>
            `;
        } else {
            // Render newsletter content
            detailDiv.innerHTML = `
                <div class="newsletter-detail">
                    <h2>${issue.title}</h2>
                    <div class="newsletter-meta">
                        <span>${new Date(issue.publish_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                        <span>•</span>
                        <span>${issue.issue_number}</span>
                        <span class="tag tier-${issue.tier_required}">${issue.tier_required}</span>
                    </div>
                    <div class="newsletter-content">
                        ${renderMarkdown(issue.content_md)}
                    </div>
                </div>
            `;
        }

        modal.style.display = 'block';
    } catch (err) {
        console.error('Error loading newsletter detail:', err);
        alert('Unable to load newsletter issue');
    }
};

// Simple markdown renderer (basic support)
function renderMarkdown(markdown) {
    if (!markdown) return '';
    
    // Convert markdown to HTML (basic implementation)
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br>');
    
    return html;
}

// Close newsletter modal
window.closeNewsletterModal = function() {
    const modal = document.getElementById('newsletter-modal');
    if (modal) {
        modal.style.display = 'none';
    }
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
                messageDiv.innerHTML = '✓ Success! Welcome to kAIzen Systems!';
                messageDiv.className = 'form-message success';
                form.reset();
                
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