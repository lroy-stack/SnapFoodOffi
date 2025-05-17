import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

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

/**
 * Unified Supabase service that combines both authentication and data operations
 * to reduce complexity and avoid redundant client instances
 */
class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        persistSession: true,
        storage: localStorage
      }
    });
  }

  // =====================
  // Auth Methods
  // =====================

  // Get the current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get current session
  async getSession() {
    return this.supabase.auth.getSession();
  }

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      return {
        user: data?.user || null,
        error
      };
    } catch (error) {
      console.error('Error during signup:', error);
      return {
        user: null,
        error
      };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        user: data?.user || null,
        error
      };
    } catch (error) {
      console.error('Error during signin:', error);
      return {
        user: null,
        error
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  }

  // Sign in with Apple
  async signInWithApple(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  }

  // Sign in with magic link
  async signInWithMagicLink(email: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      return { error };
    } catch (error) {
      console.error('Error sending magic link:', error);
      return { error };
    }
  }

  // Sign out with more robust implementation
  async signOut(): Promise<{ error: any }> {
    try {
      // Try direct fetch for sign-out first to avoid policy recursion issues
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token || ''}`
          }
        });

        if (response.ok) {
          return { error: null };
        }
      } catch (fetchError) {
        console.warn('Direct logout failed, falling back to client:', fetchError);
      }

      // Fallback to Supabase client
      const { error } = await this.supabase.auth.signOut({
        scope: 'global' // Sign out from all devices
      });

      return { error };
    } catch (error) {
      console.error('Error in signOut method:', error);
      return { error };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return { error };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      return { error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  }

  // Resend confirmation email
  async resendConfirmationEmail(email: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
      });

      return { error };
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      return { error };
    }
  }

  // Subscribe to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // =====================
  // User Profile Methods
  // =====================

  // Get user profile with a simpler approach
  async getUserProfile(userId?: string): Promise<any> {
    try {
      // If userId is not provided, get the current user's ID
      if (!userId) {
        const user = await this.getCurrentUser();
        if (!user) return null;
        userId = user.id;
      }

      const { data, error } = await this.supabase
        .from('benutzer_profil')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile method:', error);
      return null;
    }
  }

  // Check if user has admin role
  async isAdmin(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.rolle === 'admin';
  }

  // Check if user has moderator role
  async isModerator(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.rolle === 'moderator' || profile?.rolle === 'admin';
  }

  // =====================
  // Data Methods
  // =====================

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await this.supabase.from('gerichte').select('count', { count: 'exact', head: true });

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
  }

  // Generic database query method
  async query<T>(table: string, queryFn: (query: any) => any): Promise<{ data: T | null; error: any }> {
    try {
      const query = this.supabase.from(table);
      const result = await queryFn(query);
      return result;
    } catch (error) {
      console.error(`Error in query to ${table}:`, error);
      return { data: null, error };
    }
  }
}

// Create and export a single instance
export const supabaseService = new SupabaseService();

// Initialize the connection test when the app starts
(async () => {
  // We add a slight delay to ensure the rest of the app loads first
  setTimeout(async () => {
    try {
      await supabaseService.testConnection();
    } catch (error) {
      console.warn('Initial connection test failed, but application will continue to function with fallback data:', error);
    }
  }, 1000);
})();

export default supabaseService;
