import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRepository } from '../repository';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const repo = getRepository();
  const posts = await repo.getPosts();
  const result = await Promise.all(posts.map(async p => {
    const reactions = await repo.getReactions(p.id);
    const counts: Record<string, number> = {};
    reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    const reactionSummary = Object.entries(counts).map(([type, count]) => ({ type, count }));
    const commentCount = (await repo.getComments(p.id)).length;
    return { ...p, reactions: reactionSummary, commentCount };
  }));
  res.json(result);
});

router.get('/:id', async (req: Request, res: Response) => {
  const repo = getRepository();
  const post = await repo.getPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const reactions = await repo.getReactions(post.id);
  const counts: Record<string, number> = {};
  reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
  const reactionSummary = Object.entries(counts).map(([type, count]) => ({ type, count }));
  res.json({ ...post, reactions: reactionSummary });
});

router.post('/', async (req: Request, res: Response) => {
  const { author, title, content, cover_image } = req.body;
  if (!author || !title || !content) return res.status(400).json({ error: 'author, title, content required' });
  const post = {
    id: uuidv4(),
    author,
    title,
    content,
    cover_image: cover_image || undefined,
    created_at: new Date().toISOString(),
  };
  await getRepository().addPost(post);
  res.status(201).json({ ...post, reactions: [], commentCount: 0 });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await getRepository().deletePost(req.params.id);
  res.json({ success: true });
});

export default router;
