import { supabaseAdmin } from '../../config/db';

export const usersRepository = {
  async findById(id: string) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, created_at')
      .eq('id', id)
      .single();
    if (!data) return null;
    return { id: data.id, email: data.email, displayName: data.display_name, createdAt: data.created_at };
  },

  async update(id: string, data: { displayName?: string }) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .update({ display_name: data.displayName })
      .eq('id', id)
      .select('id, email, display_name, created_at')
      .single();
    if (!user) return null;
    return { id: user.id, email: user.email, displayName: user.display_name, createdAt: user.created_at };
  },

  async findByEmail(email: string) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, display_name')
      .eq('email', email)
      .single();
    return data;
  },
};
