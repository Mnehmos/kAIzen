// Supabase Initialization Wrapper
// This file handles proper async loading of the Supabase client

const SUPABASE_URL = 'https://gotgnbwiodwkrsdmighy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGduYndpb2R3a3JzZG1pZ2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTg5ODksImV4cCI6MjA3NzE5NDk4OX0.vx9veq9fEmdXCMnQsmf4Qe-bYHtY7oH5fItqf3VO-UU';

// Global Supabase client - initialized once library loads
window.kaizenSupabase = null;

// Initialize Supabase client
function initSupabase() {
    try {
        if (typeof supabase === 'undefined') {
            console.error('❌ Supabase library not loaded from CDN');
            return false;
        }
        
        if (!window.kaizenSupabase) {
            window.kaizenSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ kAIzen Supabase client initialized');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Try immediate initialization
initSupabase();

// Also try on DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', () => {
    if (!window.kaizenSupabase) {
        initSupabase();
    }
});

// Also try on window load as final fallback
window.addEventListener('load', () => {
    if (!window.kaizenSupabase) {
        initSupabase();
    }
});

// Export helper to get client with auto-retry
window.getKaizenSupabase = function() {
    if (!window.kaizenSupabase) {
        initSupabase();
    }
    return window.kaizenSupabase;
};