import { useState } from 'react';
import { addComment, uploadImage } from '../api';
import type { Comment } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  comment: Comment;
  postId: string;
  onReplyAdded: (reply: Comment, parentId: string) => void;
  depth?: number;
}

export default function CommentItem({ comment, postId, onReplyAdded, depth = 0 }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setReplyImage(url);
    } finally {
      setUploading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const reply = await addComment(postId, {
        author: replyAuthor, content: replyContent,
        parent_id: comment.id, image: replyImage || undefined
      });
      onReplyAdded(reply, comment.id);
      setReplyAuthor(''); setReplyContent(''); setReplyImage(''); setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-stone-100' : ''}`}>
      <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm mb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">{comment.author}</span>
          <span className="text-stone-400 text-xs">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
        </div>
        <p className="text-stone-700 text-sm mb-2">{comment.content}</p>
        {comment.image && (
          <img src={comment.image} alt="comment img" className="rounded-lg max-h-60 object-cover mb-2 border border-stone-100" />
        )}
        {depth < 3 && (
          <button
            onClick={() => setShowReply(v => !v)}
            className="text-xs text-rose-500 hover:underline"
          >
            {showReply ? 'Cancel' : 'Reply'}
          </button>
        )}
        {showReply && (
          <form onSubmit={handleReply} className="mt-3 space-y-2">
            <input
              className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Your name" value={replyAuthor} onChange={e => setReplyAuthor(e.target.value)} required
            />
            <textarea
              className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Your reply..." value={replyContent} onChange={e => setReplyContent(e.target.value)} required
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-rose-500 cursor-pointer hover:underline">
                {uploading ? 'Uploading...' : replyImage ? 'Image added ✓' : '+ Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <button
                type="submit" disabled={submitting || uploading}
                className="ml-auto bg-rose-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-rose-600 disabled:opacity-50"
              >
                {submitting ? '...' : 'Reply'}
              </button>
            </div>
          </form>
        )}
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} postId={postId} onReplyAdded={onReplyAdded} depth={depth + 1} />
      ))}
    </div>
  );
}
