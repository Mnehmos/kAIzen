// Techniques page functionality for kAIzen Systems

// Wait for page to load
document.addEventListener('DOMContentLoaded', async function() {
    // Wait a bit for Supabase to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadTechniques();
    setupFilters();
    setupSubscribeForm();
});

// Current filters
let currentFilters = {
    search: '',
    category: '',
    tier: ''
};

// Load techniques with current filters
async function loadTechniques() {
    const container = document.getElementById('techniques-grid');
    if (!container) return;
    
    const client = window.getKaizenSupabase();
    if (!client) {
        container.innerHTML = '<p class="error">Database connection not available. Please refresh the page.</p>';
        return;
    }

    container.innerHTML = '<div class="loading">Loading techniques...</div>';

    try {
        let query = client
            .from('techniques')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (currentFilters.category) {
            query = query.eq('category', currentFilters.category);
        }
        if (currentFilters.tier) {
            query = query.eq('tier_required', currentFilters.tier);
        }
        if (currentFilters.search) {
            query = query.or(`name.ilike.%${currentFilters.search}%,summary.ilike.%${currentFilters.search}%`);
        }

        const { data: techniques, error } = await query;

        if (error) {
            console.error('Error fetching techniques:', error);
            container.innerHTML = '<p class="error">Unable to load techniques.</p>';
            return;
        }

        if (!techniques || techniques.length === 0) {
            container.innerHTML = '<p>No techniques found matching your criteria.</p>';
            return;
        }

        container.innerHTML = techniques.map(technique => createTechniqueCard(technique)).join('');
    } catch (err) {
        console.error('Error loading techniques:', err);
        container.innerHTML = '<p class="error">Unable to load techniques.</p>';
    }
}

// Create technique card HTML
function createTechniqueCard(technique) {
    const tierBadge = technique.tier_required === 'pro'
        ? '<span class="tag tier-pro">Pro Only</span>'
        : '<span class="tag tier-free">Free</span>';

    const lockedClass = technique.tier_required === 'pro' ? 'locked' : '';

    return `
        <div class="technique-card ${lockedClass}" onclick="viewTechniqueDetail('${technique.id}')">
            <div class="technique-header">
                <div>
                    <h3 class="technique-title">${technique.name}</h3>
                    <div class="technique-version">${technique.version}</div>
                </div>
                <span class="technique-category">${technique.category}</span>
            </div>
            <p class="technique-summary">${technique.summary}</p>
            <div class="technique-footer">
                <div class="newsletter-tags">
                    ${tierBadge}
                </div>
                <div class="technique-action">
                    ${technique.tier_required === 'pro' ? '🔒 Pro Required' : 'View Details →'}
                </div>
            </div>
        </div>
    `;
}

// View technique detail
window.viewTechniqueDetail = async function(id) {
    const modal = document.getElementById('technique-modal');
    const detailDiv = document.getElementById('technique-detail');
    
    if (!modal || !detailDiv) return;
    
    const client = window.getKaizenSupabase();
    if (!client) {
        alert('Database connection not available');
        return;
    }

    try {
        const { data: technique, error } = await client
            .from('techniques')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !technique) {
            console.error('Error fetching technique:', error);
            alert('Unable to load technique details');
            return;
        }

        // Check if Pro content
        if (technique.tier_required === 'pro') {
            detailDiv.innerHTML = `
                <div class="pro-required">
                    <h2>🔒 Pro Content</h2>
                    <p>This technique is available to Pro subscribers only.</p>
                    <a href="pricing.html" class="btn btn-primary">Upgrade to Pro</a>
                </div>
            `;
        } else {
            // Parse full_spec JSON if available
            const spec = technique.full_spec || {};
            const metrics = spec.metrics?.expected_improvements || {};
            
            detailDiv.innerHTML = `
                <div class="technique-detail">
                    <h2>${technique.name}</h2>
                    <div class="technique-meta">
                        <span class="technique-version">${technique.version}</span>
                        <span>•</span>
                        <span class="technique-category">${technique.category}</span>
                        <span class="tag tier-${technique.tier_required}">${technique.tier_required}</span>
                    </div>
                    
                    <div class="technique-section">
                        <h3>Overview</h3>
                        <p>${technique.summary}</p>
                    </div>
                    
                    ${metrics.speed || metrics.cost || metrics.accuracy ? `
                    <div class="technique-section">
                        <h3>Performance Metrics</h3>
                        <div class="metrics-grid">
                            ${metrics.speed ? `<div class="metric"><strong>Speed:</strong> ${metrics.speed.value}</div>` : ''}
                            ${metrics.cost ? `<div class="metric"><strong>Cost:</strong> ${metrics.cost.value}</div>` : ''}
                            ${metrics.accuracy ? `<div class="metric"><strong>Accuracy:</strong> ${metrics.accuracy.value}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="technique-section">
                        <h3>JSON Specification</h3>
                        <pre><code>${JSON.stringify(spec, null, 2)}</code></pre>
                    </div>
                </div>
            `;
        }

        modal.style.display = 'block';
    } catch (err) {
        console.error('Error loading technique detail:', err);
        alert('Unable to load technique details');
    }
};

// Close technique modal
window.closeTechniqueModal = function() {
    const modal = document.getElementById('technique-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Setup filters
function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const tierFilter = document.getElementById('tier-filter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value;
            loadTechniques();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            loadTechniques();
        });
    }

    if (tierFilter) {
        tierFilter.addEventListener('change', (e) => {
            currentFilters.tier = e.target.value;
            loadTechniques();
        });
    }
}

// Setup subscribe form (same as home.js)
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