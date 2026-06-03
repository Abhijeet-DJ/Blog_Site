import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api';
import type { Post } from '../types';
import { formatDistanceToNow } from 'date-fns';

const EMOJI_MAP: Record<string, string> = {
  like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😠'
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-stone-400">Loading...</div>;
  if (!posts.length) return (
    <div className="text-center py-20">
      <p className="text-stone-400 text-lg mb-4">No posts yet. Be the first!</p>
      <Link to="/new" className="bg-rose-500 text-white px-6 py-2 rounded-full hover:bg-rose-600 transition">Write a post</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition">
          {post.cover_image && (
            <img src={post.cover_image} alt="cover" className="w-full h-48 object-cover" />
          )}
          <div className="p-6">
            <Link to={`/post/${post.id}`}>
              <h2 className="text-2xl font-bold font-serif mb-2 hover:text-rose-500 transition">{post.title}</h2>
            </Link>
            <p className="text-stone-500 text-sm mb-3">
              by <span className="font-medium text-stone-700">{post.author}</span> · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
            <p className="text-stone-600 line-clamp-3 mb-4">{post.content}</p>
            <div className="flex items-center gap-4 text-sm text-stone-400">
              <span className="flex gap-1">
                {post.reactions.map(r => (
                  <span key={r.type}>{EMOJI_MAP[r.type]} {r.count}</span>
                ))}
              </span>
              <span>💬 {post.commentCount}</span>
              <Link to={`/post/${post.id}`} className="ml-auto text-rose-500 hover:underline font-medium">Read more →</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
