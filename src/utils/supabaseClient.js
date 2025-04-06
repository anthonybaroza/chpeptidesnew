import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Check if the credentials are placeholders or empty
const isPlaceholder = (value) => {
  if (!value) return true;
  return value.includes('your-project-id') || 
         value.includes('your-actual-project-id') || 
         value.includes('your-supabase') || 
         value.includes('your-actual-anon-key');
};

// More subtle logging to avoid console pollution
console.log(`Initializing Supabase connection to: ${supabaseUrl?.substring(0, 15)}...`);

// Validate credentials
if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.error('ERROR: You are using placeholder Supabase credentials. Please update your .env file with your actual Supabase URL and anon key.');
}

let supabase = null;

// Only create the client if we have valid-looking credentials
if (supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)) {
  try {
    // Initialize client with more robust options
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      },
      global: {
        // Add headers for better debugging
        headers: {
          'x-client-info': 'astro-supabase'
        }
      }
    });
    
    // Test the connection with improved error handling
    if (typeof window !== 'undefined') { // Only run in browser
      // Wrap in a function to allow for better error handling
      const testConnection = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Supabase auth session check returned an error:', error.message);
            // Don't throw, just log warning and continue
          } else {
            console.log('Supabase connection verified successfully');
          }
        } catch (e) {
          console.error('Error testing Supabase connection:', e.message);
          // Don't throw, just log the error and allow the app to continue
        }
      };
      
      // Run the test after a short delay to allow the page to load first
      setTimeout(testConnection, 1500);
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
    // Don't throw, allow the app to continue with supabase as null
  }
} else {
  console.error('Missing or invalid Supabase credentials');
}

export default supabase;