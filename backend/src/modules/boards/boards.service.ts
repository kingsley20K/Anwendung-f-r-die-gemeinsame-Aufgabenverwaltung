import { boardsRepository } from './boards.repository';

export const boardsService = {
  async list(userId: string) {
    return boardsRepository.findByUser(userId);
  },

  async create(userId: string, data: { title: string; description?: string }) {
    return boardsRepository.create(userId, data);
  },

  async getOne(boardId: string) {
    const board = await boardsRepository.findById(boardId);
    if (!board) throw { status: 404, code: 'BOARD_NOT_FOUND', message: 'Board not found' };
    return board;
  },

  async update(boardId: string, data: { title?: string; description?: string }) {
    const board = await boardsRepository.update(boardId, data);
    if (!board) throw { status: 404, code: 'BOARD_NOT_FOUND', message: 'Board not found' };
    return board;
  },

  async remove(boardId: string) {
    await boardsRepository.remove(boardId);
  },

  async listMembers(boardId: string) {
    return boardsRepository.findMembers(boardId);
  },

  async addMember(boardId: string, data: { userId: string; role: string }) {
    const existing = await boardsRepository.findMember(boardId, data.userId);
    if (existing) throw { status: 409, code: 'ALREADY_MEMBER', message: 'User is already a member' };
    return boardsRepository.addMember(boardId, data.userId, data.role);
  },

  async removeMember(boardId: string, userId: string) {
    await boardsRepository.removeMember(boardId, userId);
  },
};
