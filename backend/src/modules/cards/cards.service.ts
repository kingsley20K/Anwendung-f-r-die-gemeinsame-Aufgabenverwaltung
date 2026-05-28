import { cardsRepository } from './cards.repository';

export const cardsService = {
  async create(columnId: string, userId: string, data: { title: string; description?: string }) {
    return cardsRepository.create(columnId, userId, data);
  },

  async update(cardId: string, data: { title?: string; description?: string; columnId?: string; position?: number }) {
    const card = await cardsRepository.update(cardId, data);
    if (!card) throw { status: 404, code: 'CARD_NOT_FOUND', message: 'Card not found' };
    return card;
  },

  async remove(cardId: string) {
    await cardsRepository.remove(cardId);
  },
};
