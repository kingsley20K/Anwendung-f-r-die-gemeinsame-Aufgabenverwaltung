import { authRepository } from './auth.repository';

interface RegisterInput { email: string; password: string; displayName: string }
interface LoginInput    { email: string; password: string }

export const authService = {
  async register({ email, password, displayName }: RegisterInput) {
    const result = await authRepository.signUp(email, password, displayName);
    if (!result.user || !result.session) {
      throw { status: 400, code: 'VALIDATION_ERROR', message: 'Registration failed' };
    }
    return {
      user: {
        id: result.user.id,
        email: result.user.email!,
        displayName: result.user.user_metadata.displayName,
      },
      accessToken:  result.session.access_token,
      refreshToken: result.session.refresh_token,
    };
  },

  async login({ email, password }: LoginInput) {
    const result = await authRepository.signIn(email, password);
    if (!result.user || !result.session) {
      throw { status: 401, code: 'UNAUTHORIZED', message: 'Invalid credentials' };
    }
    return {
      user: {
        id: result.user.id,
        email: result.user.email!,
        displayName: result.user.user_metadata.displayName,
      },
      accessToken:  result.session.access_token,
      refreshToken: result.session.refresh_token,
    };
  },

  async refresh(refreshToken: string) {
    const result = await authRepository.refreshSession(refreshToken);
    if (!result.session) {
      throw { status: 401, code: 'TOKEN_EXPIRED', message: 'Invalid refresh token' };
    }
    return { accessToken: result.session.access_token };
  },

  async logout(accessToken: string) {
    await authRepository.signOut(accessToken);
  },
};
