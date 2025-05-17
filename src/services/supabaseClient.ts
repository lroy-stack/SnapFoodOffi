import { createClient } from '@supabase/supabase-js';

// Get environment variables from import.meta.env (Vite exposes them this way)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available and log helpful errors if not
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable. Make sure you have created an .env file with the correct values.');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable. Make sure you have created an .env file with the correct values.');
}

// Create the Supabase client with error handling
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      storage: localStorage
    }
  }
);

// Add a simple test method to verify connection
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('gerichte').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};

// Initialize the connection test when the app starts
(async () => {
  // We add a slight delay to ensure the rest of the app loads first
  setTimeout(async () => {
    try {
      await testConnection();
    } catch (error) {
      console.warn('Initial connection test failed, but application will continue to function with fallback data:', error);
    }
  }, 1000);
})();