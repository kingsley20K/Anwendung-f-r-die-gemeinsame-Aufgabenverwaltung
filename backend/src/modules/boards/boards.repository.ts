import { supabaseAdmin } from '../../config/db';

// Map raw Supabase card row (snake_case) to the shape the frontend expects
function mapCard(raw: any, columnId: string) {
  return {
    id:          raw.id,
    columnId,
    title:       raw.title,
    description: raw.description,
    position:    raw.position,
    createdAt:   raw.created_at,
    createdBy:   raw.created_by
      ? { id: raw.created_by.id, displayName: raw.created_by.display_name }
      : undefined,
  };
}

// Map raw Supabase board row (snake_case) to the shape the frontend expects
function mapBoard(raw: any) {
  return {
    id:          raw.id,
    title:       raw.title,
    description: raw.description,
    owner:       { id: raw.owner.id, displayName: raw.owner.display_name },
    columns: (raw.columns ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((col: any) => ({
        id:       col.id,
        boardId:  raw.id,
        title:    col.title,
        position: col.position,
        cards: (col.cards ?? [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((card: any) => mapCard(card, col.id)),
      })),
  };
}

export const boardsRepository = {
  async findByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('board_members')
      .select('role, boards(id, title, description, created_at)')
      .eq('user_id', userId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return (data ?? []).map((m: any) => ({
      id:          m.boards.id,
      title:       m.boards.title,
      description: m.boards.description,
      role:        m.role,
      columns:     [],   // not loaded in list view — avoids crash in BoardsPage
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
    return mapBoard(data);
  },

  async create(userId: string, data: { title: string; description?: string }) {
    const { data: board, error } = await supabaseAdmin
      .from('boards')
      .insert({ title: data.title, description: data.description ?? null, owner_id: userId })
      .select('id, title, description')
      .single();
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };

    await supabaseAdmin.from('board_members').insert({ board_id: board.id, user_id: userId, role: 'owner' });
    return { ...board, columns: [] };
  },

  async update(boardId: string, data: { title?: string; description?: string }) {
    const { data: board, error } = await supabaseAdmin
      .from('boards')
      .update(data)
      .eq('id', boardId)
      .select('id, title, description')
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
    return (data ?? []).map((m: any) => ({
      id:          m.users.id,
      displayName: m.users.display_name,
      role:        m.role,
      joinedAt:    m.joined_at,
    }));
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
    return {
      id:          (data as any).users.id,
      displayName: (data as any).users.display_name,
      role:        (data as any).role,
      joinedAt:    (data as any).joined_at,
    };
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
