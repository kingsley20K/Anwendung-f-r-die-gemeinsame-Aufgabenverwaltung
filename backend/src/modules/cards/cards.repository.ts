import { supabaseAdmin } from '../../config/db';

// Map raw Supabase card row (snake_case) to the shape the frontend expects
function mapCard(raw: any) {
  return {
    id:          raw.id,
    columnId:    raw.column_id,
    title:       raw.title,
    description: raw.description,
    position:    raw.position,
    createdAt:   raw.created_at,
    createdBy:   raw.created_by
      ? { id: raw.created_by.id, displayName: raw.created_by.display_name }
      : undefined,
  };
}

const CARD_SELECT = 'id, column_id, title, description, position, created_at, created_by:users!cards_created_by_fkey(id, display_name)';

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
      .select(CARD_SELECT)
      .single();
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return mapCard(card);
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
      .select(CARD_SELECT)
      .single();
    if (error) return null;
    return mapCard(card);
  },

  async remove(cardId: string) {
    const { error } = await supabaseAdmin.from('cards').delete().eq('id', cardId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
  },
};
