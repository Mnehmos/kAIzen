// Modal functionality for subscribe and content modals

// Subscribe Modal
function openSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear form
        const form = document.getElementById('subscribe-form');
        if (form) form.reset();
        
        // Clear message
        const message = document.getElementById('subscribe-message');
        if (message) message.innerHTML = '';
    }
}

// Newsletter Modal
function openNewsletterModal() {
    const modal = document.getElementById('newsletter-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeNewsletterModal() {
    const modal = document.getElementById('newsletter-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Technique Modal
function openTechniqueModal() {
    const modal = document.getElementById('technique-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeTechniqueModal() {
    const modal = document.getElementById('technique-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.openSubscribeModal = openSubscribeModal;
    window.closeSubscribeModal = closeSubscribeModal;
    window.openNewsletterModal = openNewsletterModal;
    window.closeNewsletterModal = closeNewsletterModal;
    window.openTechniqueModal = openTechniqueModal;
    window.closeTechniqueModal = closeTechniqueModal;
}