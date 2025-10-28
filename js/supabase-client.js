// Supabase Client Configuration
// kAIzen Systems Production Credentials
const SUPABASE_URL = 'https://gotgnbwiodwkrsdmighy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGduYndpb2R3a3JzZG1pZ2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTg5ODksImV4cCI6MjA3NzE5NDk4OX0.vx9veq9fEmdXCMnQsmf4Qe-bYHtY7oH5fItqf3VO-UU';

// Initialize Supabase client - wait for library to load
let supabaseClient = null;

// Initialize when DOM is ready
function initializeSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
        return true;
    } else {
        console.error('❌ Supabase library not found. Make sure CDN script is loaded.');
        return false;
    }
}

// Try to initialize immediately if library is already loaded
if (typeof supabase !== 'undefined') {
    initializeSupabase();
}

// Also try when DOM is ready (in case library loads after this script)
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (!supabaseClient) {
            initializeSupabase();
        }
    });
}

// Export client getter
export function getSupabaseClient() {
    if (!supabaseClient) {
        initializeSupabase();
    }
    return supabaseClient;
}

// Email subscription function
export async function subscribeEmail(email) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase client not initialized');
        return { success: false, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await client
            .from('subscribers')
            .insert([{ 
                email: email, 
                tier: 'free',
                subscribed_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            // Check for duplicate email
            if (error.code === '23505') {
                return { success: false, error: 'This email is already subscribed!' };
            }
            console.error('Subscription error:', error);
            return { success: false, error: 'Failed to subscribe. Please try again.' };
        }

        // Track signup event
        trackEvent('email_signup', { tier: 'free' });

        return { success: true, data };
    } catch (err) {
        console.error('Subscription error:', err);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

// Get newsletter issues
export async function getNewsletterIssues(limit = null) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        let query = client
            .from('newsletter_issues')
            .select('*')
            .order('publish_date', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching newsletter issues:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error fetching newsletter issues:', err);
        return { data: null, error: err };
    }
}

// Get single newsletter issue
export async function getNewsletterIssue(id) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await client
            .from('newsletter_issues')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching newsletter issue:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error fetching newsletter issue:', err);
        return { data: null, error: err };
    }
}

// Get techniques
export async function getTechniques(filters = {}) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        let query = client
            .from('techniques')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.tier) {
            query = query.eq('tier_required', filters.tier);
        }
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching techniques:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error fetching techniques:', err);
        return { data: null, error: err };
    }
}

// Get single technique
export async function getTechnique(id) {
    const client = getSupabaseClient();
    if (!client) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await client
            .from('techniques')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching technique:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error fetching technique:', err);
        return { data: null, error: err };
    }
}

// Track page view (simple analytics)
export async function trackPageView(pagePath) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        await client.from('page_views').insert([{
            page_path: pagePath,
            viewed_at: new Date().toISOString(),
            referrer: document.referrer || null,
            user_agent: navigator.userAgent
        }]);
    } catch (err) {
        // Silently fail analytics
        console.debug('Analytics tracking failed:', err);
    }
}

// Generic event tracking
export async function trackEvent(eventName, eventData = {}) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        await client.from('page_views').insert([{
            page_path: `event:${eventName}`,
            viewed_at: new Date().toISOString(),
            referrer: JSON.stringify(eventData),
            user_agent: navigator.userAgent
        }]);
    } catch (err) {
        console.debug('Event tracking failed:', err);
    }
}

// Initialize analytics on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        trackPageView(window.location.pathname);
    });
}