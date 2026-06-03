import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPost } from '../api';
import type { Post } from '../types';
import { formatDistanceToNow } from 'date-fns';
import ReactionBar from '../components/ReactionBar';
import CommentsSection from '../components/CommentsSection';

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPost(id).then(setPost).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-stone-400">Loading...</div>;
  if (!post) return <div className="text-center py-20 text-stone-400">Post not found.</div>;

  return (
    <article className="max-w-2xl mx-auto">
      <Link to="/" className="text-rose-500 text-sm hover:underline mb-6 block">← Back to posts</Link>
      {post.cover_image && (
        <img src={post.cover_image} alt="cover" className="w-full h-72 object-cover rounded-2xl mb-6 shadow" />
      )}
      <h1 className="text-4xl font-bold font-serif mb-3">{post.title}</h1>
      <p className="text-stone-400 text-sm mb-8">
        by <span className="font-medium text-stone-600">{post.author}</span> · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
      </p>
      <div className="prose prose-stone max-w-none whitespace-pre-wrap text-stone-700 leading-relaxed text-lg mb-6">
        {post.content}
      </div>
      <hr className="border-stone-100 my-6" />
      <ReactionBar postId={post.id} />
      <CommentsSection postId={post.id} />
    </article>
  );
}
