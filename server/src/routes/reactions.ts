import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRepository } from '../repository';

const router = Router();

const VALID_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

router.post('/:postId', async (req: Request, res: Response) => {
  const { type, reactor } = req.body;
  if (!VALID_TYPES.includes(type) || !reactor) return res.status(400).json({ error: 'Invalid reaction' });

  const repo = getRepository();
  const existing = await repo.findReaction(req.params.postId, reactor, type);
  if (existing) {
    await repo.removeReaction(existing.id);
    return res.json({ toggled: 'removed' });
  }

  // One reaction type per user per post — clear any previous type first
  await repo.clearReactionsBy(req.params.postId, reactor);
  await repo.addReaction({
    id: uuidv4(),
    post_id: req.params.postId,
    type,
    reactor,
    created_at: new Date().toISOString(),
  });
  res.json({ toggled: 'added', type });
});

router.get('/:postId', async (req: Request, res: Response) => {
  const reactions = await getRepository().getReactions(req.params.postId);
  const counts: Record<string, number> = {};
  reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
  res.json(Object.entries(counts).map(([type, count]) => ({ type, count })));
});

export default router;
