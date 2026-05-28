import { columnsRepository } from './columns.repository';

export const columnsService = {
  async create(boardId: string, data: { title: string }) {
    return columnsRepository.create(boardId, data.title);
  },

  async update(columnId: string, data: { title?: string; position?: number }) {
    const column = await columnsRepository.update(columnId, data);
    if (!column) throw { status: 404, code: 'COLUMN_NOT_FOUND', message: 'Column not found' };
    return column;
  },

  async remove(columnId: string) {
    await columnsRepository.remove(columnId);
  },
};
