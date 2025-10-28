// Supabase Client Configuration
// kAIzen Systems Production Credentials
const SUPABASE_URL = 'https://gotgnbwiodwkrsdmighy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdGduYndpb2R3a3JzZG1pZ2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTg5ODksImV4cCI6MjA3NzE5NDk4OX0.vx9veq9fEmdXCMnQsmf4Qe-bYHtY7oH5fItqf3VO-UU';

// Initialize Supabase client
let supabase = null;

// Check if we're running in browser with Supabase loaded
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase client library not loaded. Please include it in your HTML.');
}

// Export for use in other modules
export { supabase };

// Email subscription function
export async function subscribeEmail(email) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return { success: false, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await supabase
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
    if (!supabase) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        let query = supabase
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
    if (!supabase) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await supabase
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
    if (!supabase) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        let query = supabase
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
    if (!supabase) {
        console.error('Supabase client not initialized');
        return { data: null, error: 'Database connection not available' };
    }

    try {
        const { data, error } = await supabase
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
    if (!supabase) return;

    try {
        await supabase.from('page_views').insert([{
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
    if (!supabase) return;

    try {
        await supabase.from('page_views').insert([{
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