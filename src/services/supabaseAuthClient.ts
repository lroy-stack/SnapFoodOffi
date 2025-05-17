import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SupabaseAuthService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: localStorage
      }
    });
  }

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

  // Sign out - using direct API call to avoid policy recursion issues
  async signOut(): Promise<{ error: any }> {
    try {
      // Try direct fetch for sign-out first
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

  // Get user profile with role
  async getUserProfile(): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) return null;
      
      const { data, error } = await this.supabase
        .from('benutzer_profil')
        .select('*')
        .eq('auth_id', user.id)
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

  // Get auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

export const supabaseAuth = new SupabaseAuthService();