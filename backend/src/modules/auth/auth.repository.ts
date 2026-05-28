import { supabase, supabaseAdmin } from '../../config/db';

export const authRepository = {
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName } },
    });
    if (error) throw { status: 400, code: 'VALIDATION_ERROR', message: error.message };
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const message = error.message.toLowerCase().includes('confirm')
        ? 'Please confirm your email address before logging in'
        : 'Invalid email or password';
      throw { status: 401, code: 'UNAUTHORIZED', message };
    }
    return data;
  },

  async refreshSession(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw { status: 401, code: 'TOKEN_EXPIRED', message: 'Invalid refresh token' };
    return data;
  },

  async signOut(userId: string) {
    const { error } = await supabaseAdmin.auth.admin.signOut(userId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
  },
};
