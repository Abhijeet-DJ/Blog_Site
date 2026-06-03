import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRepository } from '../repository';
import { Comment } from '../repository/interface';

const router = Router();

function buildTree(comments: Comment[]): (Comment & { replies: any[] })[] {
  const map = new Map<string, Comment & { replies: any[] }>();
  comments.forEach(c => map.set(c.id, { ...c, replies: [] }));
  const roots: (Comment & { replies: any[] })[] = [];
  map.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(c);
    } else if (!c.parent_id) {
      roots.push(c);
    }
  });
  return roots;
}

router.get('/:postId', async (req: Request, res: Response) => {
  const comments = await getRepository().getComments(req.params.postId);
  res.json(buildTree(comments));
});

router.post('/:postId', async (req: Request, res: Response) => {
  const { author, content, parent_id, image } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'author and content required' });
  const comment: Comment = {
    id: uuidv4(),
    post_id: req.params.postId,
    parent_id: parent_id || undefined,
    author,
    content,
    image: image || undefined,
    created_at: new Date().toISOString(),
  };
  await getRepository().addComment(comment);
  res.status(201).json({ ...comment, replies: [] });
});

export default router;
