import { supabaseAdmin } from '../../config/db';

export const boardsRepository = {
  async findByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('board_members')
      .select('role, boards(id, title, description, created_at, board_members(count))')
      .eq('user_id', userId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return (data ?? []).map((m: any) => ({
      ...m.boards,
      role: m.role,
      memberCount: m.boards.board_members[0].count,
    }));
  },

  async findById(boardId: string) {
    const { data, error } = await supabaseAdmin
      .from('boards')
      .select(`
        id, title, description,
        owner:users!boards_owner_id_fkey(id, display_name),
        columns(id, title, position,
          cards(id, title, description, position, created_at,
            created_by:users!cards_created_by_fkey(id, display_name)
          )
        )
      `)
      .eq('id', boardId)
      .single();
    if (error) return null;
    return data;
  },

  async create(userId: string, data: { title: string; description?: string }) {
    const { data: board, error } = await supabaseAdmin
      .from('boards')
      .insert({ title: data.title, description: data.description ?? null, owner_id: userId })
      .select()
      .single();
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };

    await supabaseAdmin.from('board_members').insert({ board_id: board.id, user_id: userId, role: 'owner' });
    return board;
  },

  async update(boardId: string, data: { title?: string; description?: string }) {
    const { data: board, error } = await supabaseAdmin
      .from('boards')
      .update(data)
      .eq('id', boardId)
      .select()
      .single();
    if (error) return null;
    return board;
  },

  async remove(boardId: string) {
    const { error } = await supabaseAdmin.from('boards').delete().eq('id', boardId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
  },

  async findMembers(boardId: string) {
    const { data, error } = await supabaseAdmin
      .from('board_members')
      .select('role, joined_at, users(id, display_name)')
      .eq('board_id', boardId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return (data ?? []).map((m: any) => ({ ...m.users, role: m.role, joinedAt: m.joined_at }));
  },

  async findMember(boardId: string, userId: string) {
    const { data } = await supabaseAdmin
      .from('board_members')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', userId)
      .single();
    return data;
  },

  async addMember(boardId: string, userId: string, role: string) {
    const { data, error } = await supabaseAdmin
      .from('board_members')
      .insert({ board_id: boardId, user_id: userId, role })
      .select('role, joined_at, users(id, display_name)')
      .single();
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return { ...(data as any).users, role: (data as any).role, joinedAt: (data as any).joined_at };
  },

  async removeMember(boardId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('board_members')
      .delete()
      .eq('board_id', boardId)
      .eq('user_id', userId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
  },
};
