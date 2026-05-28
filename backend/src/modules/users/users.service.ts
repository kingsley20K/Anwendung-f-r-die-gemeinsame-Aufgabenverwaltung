import { usersRepository } from './users.repository';

export const usersService = {
  async getById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    return user;
  },

  async update(id: string, data: { displayName?: string }) {
    const user = await usersRepository.update(id, data);
    if (!user) throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    return user;
  },

  async findByEmail(email: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    return { id: user.id, displayName: user.display_name };
  },
};
