import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/db';

export const requireBoardMember = async (req: Request, res: Response, next: NextFunction) => {
  const { boardId } = req.params;
  const userId = req.user!.id;

  const { data } = await supabaseAdmin
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .single();

  if (!data) {
    return next({ status: 403, code: 'FORBIDDEN', message: 'Not a board member' });
  }

  req.boardRole = data.role as 'owner' | 'member';
  next();
};

export const requireBoardOwner = (req: Request, res: Response, next: NextFunction) => {
  if (req.boardRole !== 'owner') {
    return next({ status: 403, code: 'FORBIDDEN', message: 'Owner access required' });
  }
  next();
};
