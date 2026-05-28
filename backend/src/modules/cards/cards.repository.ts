import { supabaseAdmin } from '../../config/db';

export const cardsRepository = {
  async create(columnId: string, userId: string, data: { title: string; description?: string }) {
    const { data: maxPos } = await supabaseAdmin
      .from('cards')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position ?? 0) + 1000;

    const { data: card, error } = await supabaseAdmin
      .from('cards')
      .insert({ column_id: columnId, created_by: userId, title: data.title, description: data.description ?? null, position })
      .select('id, column_id, title, description, position, created_at, created_by:users!cards_created_by_fkey(id, display_name)')
      .single();
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return card;
  },

  async update(cardId: string, data: { title?: string; description?: string; columnId?: string; position?: number }) {
    const patch: Record<string, unknown> = {};
    if (data.title       !== undefined) patch.title       = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.columnId    !== undefined) patch.column_id   = data.columnId;
    if (data.position    !== undefined) patch.position    = data.position;

    const { data: card, error } = await supabaseAdmin
      .from('cards')
      .update(patch)
      .eq('id', cardId)
      .select('id, column_id, title, description, position, created_at, created_by:users!cards_created_by_fkey(id, display_name)')
      .single();
    if (error) return null;
    return card;
  },

  async remove(cardId: string) {
    const { error } = await supabaseAdmin.from('cards').delete().eq('id', cardId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
  },
};
