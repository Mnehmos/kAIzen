import { subscribeEmail, getTechniques, getTechnique } from './supabase-client.js';

let allTechniques = [];

// Load all techniques
async function loadTechniques(filters = {}) {
    const container = document.getElementById('techniques-grid');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading techniques...</div>';

    const { data: techniques, error } = await getTechniques(filters);

    if (error || !techniques) {
        container.innerHTML = '<p class="error">Unable to load techniques. Please try again later.</p>';
        return;
    }

    if (techniques.length === 0) {
        container.innerHTML = '<p>No techniques found matching your criteria.</p>';
        return;
    }

    allTechniques = techniques;
    container.innerHTML = techniques.map(technique => createTechniqueCard(technique)).join('');
}

// Create technique card HTML
function createTechniqueCard(technique) {
    const tierBadge = technique.tier_required === 'pro'
        ? '<span class="badge badge-pro">Pro</span>'
        : '<span class="badge badge-free">Free</span>';

    const lockedClass = technique.tier_required === 'pro' ? 'locked' : '';
    const clickHandler = technique.tier_required === 'pro' 
        ? 'onclick="showUpgradePrompt()"'
        : `onclick="viewTechniqueDetail('${technique.id}')"`;

    // Extract key metrics from full_spec if available
    let metrics = '';
    if (technique.full_spec) {
        const spec = typeof technique.full_spec === 'string' 
            ? JSON.parse(technique.full_spec) 
            : technique.full_spec;
        
        if (spec.metrics) {
            const m = spec.metrics;
            metrics = `
                <div class="technique-metrics">
                    ${m.token_efficiency ? `
                        <div class="metric">
                            <div class="metric-label">Token Efficiency</div>
                            <div class="metric-value">${m.token_efficiency}</div>
                        </div>
                    ` : ''}
                    ${m.quality_improvement ? `
                        <div class="metric">
                            <div class="metric-label">Quality</div>
                            <div class="metric-value">${m.quality_improvement}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }

    return `
        <div class="technique-card ${lockedClass}" ${clickHandler}>
            <div class="technique-header">
                <div>
                    <h3 class="technique-title">${technique.name}</h3>
                    <div class="technique-version">${technique.version}</div>
                </div>
                ${tierBadge}
            </div>
            <div class="technique-category">${technique.category}</div>
            <p class="technique-summary">${technique.summary}</p>
            ${metrics}
        </div>
    `;
}

// View technique detail in modal
window.viewTechniqueDetail = async function(id) {
    const modal = document.getElementById('technique-modal');
    const detailContainer = document.getElementById('technique-detail');
    
    if (!modal || !detailContainer) return;

    // Show modal with loading state
    detailContainer.innerHTML = '<div class="loading">Loading technique...</div>';
    openTechniqueModal();

    // Fetch full technique
    const { data: technique, error } = await getTechnique(id);

    if (error || !technique) {
        detailContainer.innerHTML = '<p class="error">Unable to load technique. Please try again.</p>';
        return;
    }

    // Parse full spec
    const spec = typeof technique.full_spec === 'string' 
        ? JSON.parse(technique.full_spec) 
        : technique.full_spec;

    // Render full technique
    detailContainer.innerHTML = renderTechniqueDetail(technique, spec);
};

// Render technique detail
function renderTechniqueDetail(technique, spec) {
    const tierBadge = technique.tier_required === 'pro'
        ? '<span class="badge badge-pro">Pro</span>'
        : '<span class="badge badge-free">Free</span>';

    // Render prompts
    const promptsHtml = spec.prompts ? `
        <div class="technique-section">
            <h3>Prompts</h3>
            ${spec.prompts.map(prompt => `
                <div class="prompt-block">
                    <h4>${prompt.role}</h4>
                    <pre><code>${escapeHtml(prompt.content)}</code></pre>
                    ${prompt.variables ? `
                        <div class="prompt-variables">
                            <strong>Variables:</strong> ${prompt.variables.join(', ')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    ` : '';

    // Render examples
    const examplesHtml = spec.examples ? `
        <div class="technique-section">
            <h3>Examples</h3>
            ${spec.examples.map((example, idx) => `
                <div class="example-block">
                    <h4>Example ${idx + 1}: ${example.scenario || 'Use Case'}</h4>
                    <div class="example-input">
                        <strong>Input:</strong>
                        <pre><code>${escapeHtml(example.input)}</code></pre>
                    </div>
                    <div class="example-output">
                        <strong>Output:</strong>
                        <pre><code>${escapeHtml(example.output)}</code></pre>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '';

    // Render metrics
    const metricsHtml = spec.metrics ? `
        <div class="technique-section">
            <h3>Performance Metrics</h3>
            <div class="metrics-grid">
                ${spec.metrics.token_efficiency ? `
                    <div class="metric-card">
                        <div class="metric-label">Token Efficiency</div>
                        <div class="metric-value">${spec.metrics.token_efficiency}</div>
                    </div>
                ` : ''}
                ${spec.metrics.quality_improvement ? `
                    <div class="metric-card">
                        <div class="metric-label">Quality Improvement</div>
                        <div class="metric-value">${spec.metrics.quality_improvement}</div>
                    </div>
                ` : ''}
                ${spec.metrics.implementation_time ? `
                    <div class="metric-card">
                        <div class="metric-label">Implementation Time</div>
                        <div class="metric-value">${spec.metrics.implementation_time}</div>
                    </div>
                ` : ''}
                ${spec.metrics.error_reduction ? `
                    <div class="metric-card">
                        <div class="metric-label">Error Reduction</div>
                        <div class="metric-value">${spec.metrics.error_reduction}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    ` : '';

    // Render best practices
    const bestPracticesHtml = spec.best_practices && spec.best_practices.length > 0 ? `
        <div class="technique-section">
            <h3>Best Practices</h3>
            <ul>
                ${spec.best_practices.map(practice => `<li>${practice}</li>`).join('')}
            </ul>
        </div>
    ` : '';

    return `
        <div class="technique-detail">
            <div class="technique-header">
                <div>
                    <h2>${technique.name}</h2>
                    <div class="technique-meta">
                        <span>${technique.version}</span>
                        <span>•</span>
                        <span>${technique.category}</span>
                        <span>•</span>
                        ${tierBadge}
                    </div>
                </div>
            </div>
            
            <div class="technique-section">
                <h3>Overview</h3>
                <p>${technique.summary}</p>
            </div>

            ${spec.description ? `
                <div class="technique-section">
                    <h3>Description</h3>
                    <p>${spec.description}</p>
                </div>
            ` : ''}

            ${promptsHtml}
            ${examplesHtml}
            ${metricsHtml}
            ${bestPracticesHtml}

            <div class="technique-section">
                <h3>JSON Specification</h3>
                <pre><code>${JSON.stringify(spec, null, 2)}</code></pre>
            </div>
        </div>
    `;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show upgrade prompt for pro content
window.showUpgradePrompt = function() {
    const confirmed = confirm('This technique is available for Pro subscribers only. Would you like to upgrade to Pro for $19/month?');
    if (confirmed) {
        window.location.href = 'pricing.html';
    }
};

// Handle search and filters
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const tierFilter = document.getElementById('tier-filter');

    // Debounce search
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (tierFilter) {
        tierFilter.addEventListener('change', applyFilters);
    }

    // Handle subscribe form
    const form = document.getElementById('subscribe-form');
    const emailInput = document.getElementById('email-input');
    const messageDiv = document.getElementById('subscribe-message');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email) return;

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';

            messageDiv.innerHTML = '';

            const result = await subscribeEmail(email);

            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe Free';

            if (result.success) {
                messageDiv.innerHTML = '✓ Success! Check your email to confirm your subscription.';
                messageDiv.className = 'form-message success';
                form.reset();
                
                setTimeout(() => {
                    closeSubscribeModal();
                }, 2000);
            } else {
                messageDiv.innerHTML = `✗ ${result.error}`;
                messageDiv.className = 'form-message error';
            }
        });
    }

    // Initial load
    loadTechniques();

    // Check for technique ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const techniqueId = urlParams.get('id');
    if (techniqueId) {
        viewTechniqueDetail(techniqueId);
    }
});

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.trim() || '';
    const category = document.getElementById('category-filter')?.value || '';
    const tier = document.getElementById('tier-filter')?.value || '';

    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (category) filters.category = category;
    if (tier) filters.tier = tier;

    loadTechniques(filters);
}