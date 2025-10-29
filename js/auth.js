// kAIzen Systems - Authentication Module
// Handles user authentication, session management, and tier checking

// Get Supabase client
function getAuthClient() {
    if (typeof window.getKaizenSupabase === 'function') {
        return window.getKaizenSupabase();
    }
    console.error('Supabase client not available');
    return null;
}

// Current session state
let currentSession = null;
let currentUser = null;
let userTier = null;

// Initialize authentication on page load
async function initAuth() {
    const client = getAuthClient();
    if (!client) return;

    try {
        // Get current session
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return;
        }

        if (session) {
            currentSession = session;
            currentUser = session.user;
            await loadUserTier();
            updateUIForAuthState(true);
        } else {
            updateUIForAuthState(false);
        }

        // Listen for auth state changes
        client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            currentSession = session;
            currentUser = session?.user || null;
            
            if (session) {
                await loadUserTier();
                updateUIForAuthState(true);
            } else {
                userTier = null;
                updateUIForAuthState(false);
            }
        });
    } catch (err) {
        console.error('Error initializing auth:', err);
    }
}

// Load user's tier from database
async function loadUserTier() {
    const client = getAuthClient();
    if (!client || !currentUser) {
        userTier = null;
        return;
    }

    try {
        const { data, error } = await client
            .from('subscribers')
            .select('tier')
            .eq('user_id', currentUser.id)
            .single();

        if (error) {
            console.error('Error loading user tier:', error);
            userTier = 'free'; // Default to free
            return;
        }

        userTier = data?.tier || 'free';
    } catch (err) {
        console.error('Error loading tier:', err);
        userTier = 'free';
    }
}

// Sign up with email and password
async function signUp(email, password) {
    const client = getAuthClient();
    if (!client) {
        return { success: false, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/index.html`
            }
        });

        if (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }

        // The trigger will automatically create a subscriber record
        return { success: true, data, needsVerification: data.user?.identities?.length === 0 };
    } catch (err) {
        console.error('Signup error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Sign in with email and password
async function signIn(email, password) {
    const client = getAuthClient();
    if (!client) {
        return { success: false, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }

        currentSession = data.session;
        currentUser = data.user;
        await loadUserTier();
        
        return { success: true, data };
    } catch (err) {
        console.error('Login error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Sign out
async function signOut() {
    const client = getAuthClient();
    if (!client) return;

    try {
        const { error } = await client.auth.signOut();
        
        if (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }

        currentSession = null;
        currentUser = null;
        userTier = null;
        
        return { success: true };
    } catch (err) {
        console.error('Logout error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Request password reset
async function resetPassword(email) {
    const client = getAuthClient();
    if (!client) {
        return { success: false, error: 'Database connection not available' };
    }

    try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/account.html`
        });

        if (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Password reset error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Update password (after reset)
async function updatePassword(newPassword) {
    const client = getAuthClient();
    if (!client) {
        return { success: false, error: 'Database connection not available' };
    }

    try {
        const { error } = await client.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Password update error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Password update error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return currentSession !== null && currentUser !== null;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Get user tier
function getUserTier() {
    return userTier || 'free';
}

// Check if user has Pro access
function hasProAccess() {
    return userTier === 'pro';
}

// Check if user can access content based on tier requirement
function canAccessContent(requiredTier) {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'pro') return hasProAccess();
    return false;
}

// Update UI based on authentication state
function updateUIForAuthState(isLoggedIn) {
    // Update navigation buttons
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (authButtons && userMenu) {
        if (isLoggedIn) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'block';
            
            // Update user email in menu
            const userEmailSpan = document.getElementById('user-email');
            if (userEmailSpan && currentUser) {
                userEmailSpan.textContent = currentUser.email;
            }
            
            // Update tier badge
            const tierBadge = document.getElementById('user-tier-badge');
            if (tierBadge) {
                tierBadge.textContent = userTier === 'pro' ? 'Pro' : 'Free';
                tierBadge.className = `tier-badge tier-${userTier}`;
            }
        } else {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
    
    // Emit custom event for other components to react to auth state
    window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { isLoggedIn, user: currentUser, tier: userTier }
    }));
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
        showLoginForm();
    }
}

// Show signup form in modal
function showSignupForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');
    
    if (loginForm && signupForm) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

// Show login form in modal
function showLoginForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');
    
    if (loginForm && signupForm) {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
        // Clear forms
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        // Clear messages
        const messages = modal.querySelectorAll('.form-message');
        messages.forEach(msg => msg.innerHTML = '');
    }
}

// Initialize auth when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }
    
    // Export functions to window for global access
    window.kaizenAuth = {
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        isAuthenticated,
        getCurrentUser,
        getUserTier,
        hasProAccess,
        canAccessContent,
        showLoginModal,
        showSignupForm,
        showLoginForm,
        closeAuthModal
    };
}