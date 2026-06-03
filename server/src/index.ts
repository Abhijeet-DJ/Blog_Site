import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { uploadBuffer } from './cloudinary';
import { initRepository } from './repository';
import postsRouter from './routes/posts';
import reactionsRouter from './routes/reactions';
import commentsRouter from './routes/comments';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

app.use(cors());
app.use(express.json());

app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const url = await uploadBuffer(req.file.buffer, 'daisy-blog');
    res.json({ url });
  } catch {
    res.status(500).json({ error: 'Upload to Cloudinary failed' });
  }
});

app.use('/api/posts', postsRouter);
app.use('/api/reactions', reactionsRouter);
app.use('/api/comments', commentsRouter);

async function start() {
  await initRepository();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
