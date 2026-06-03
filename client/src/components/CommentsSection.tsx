import { useState, useEffect, useRef } from 'react';
import { getComments, addComment, uploadImage } from '../api';
import type { Comment } from '../types';
import CommentItem from './CommentItem';

export default function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getComments(postId).then(setComments);
  }, [postId]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImage(url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const c = await addComment(postId, { author, content, image: image || undefined });
      setComments(prev => [c, ...prev]);
      setAuthor(''); setContent(''); setImage(''); setImagePreview('');
    } finally {
      setSubmitting(false);
    }
  };

  const addReplyToTree = (reply: Comment, parentId: string, nodes: Comment[]): Comment[] =>
    nodes.map(n => {
      if (n.id === parentId) return { ...n, replies: [...(n.replies || []), reply] };
      return { ...n, replies: addReplyToTree(reply, parentId, n.replies || []) };
    });

  const handleReplyAdded = (reply: Comment, parentId: string) => {
    setComments(prev => addReplyToTree(reply, parentId, prev));
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold font-serif mb-5">Comments</h3>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm mb-8 space-y-3">
        <input
          className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
          placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} required
        />
        <textarea
          className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm resize-none h-24"
          placeholder="Share your thoughts..." value={content} onChange={e => setContent(e.target.value)} required
        />
        {imagePreview && (
          <img src={imagePreview} alt="preview" className="rounded-xl max-h-40 object-cover border border-stone-100" />
        )}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-rose-500 hover:underline">
            {uploading ? 'Uploading...' : image ? 'Image added ✓' : '+ Add image'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <button
            type="submit" disabled={submitting || uploading}
            className="ml-auto bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
      <div className="space-y-4">
        {comments.length === 0
          ? <p className="text-stone-400 text-sm text-center py-8">No comments yet. Start the conversation!</p>
          : comments.map(c => <CommentItem key={c.id} comment={c} postId={postId} onReplyAdded={handleReplyAdded} />)
        }
      </div>
    </div>
  );
}
