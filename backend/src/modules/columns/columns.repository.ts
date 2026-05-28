import { supabaseAdmin } from '../../config/db';

export const columnsRepository = {
  async create(boardId: string, title: string) {
    const { data: maxPos } = await supabaseAdmin
      .from('columns')
      .select('position')
      .eq('board_id', boardId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position ?? 0) + 1000;

    const { data, error } = await supabaseAdmin
      .from('columns')
      .insert({ board_id: boardId, title, position })
      .select()
      .single();
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
    return { ...data, cards: [] };
  },

  async update(columnId: string, data: { title?: string; position?: number }) {
    const { data: column, error } = await supabaseAdmin
      .from('columns')
      .update(data)
      .eq('id', columnId)
      .select()
      .single();
    if (error) return null;
    return column;
  },

  async remove(columnId: string) {
    const { error } = await supabaseAdmin.from('columns').delete().eq('id', columnId);
    if (error) throw { status: 500, code: 'INTERNAL_ERROR', message: error.message };
  },
};
