import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost, uploadImage } from '../api';

export default function NewPostPage() {
  const navigate = useNavigate();
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setCoverUrl(url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const post = await createPost({ author, title, content, cover_image: coverUrl || undefined });
      navigate(`/post/${post.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-serif mb-8">Write a Post</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Your name</label>
          <input
            className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={author} onChange={e => setAuthor(e.target.value)} placeholder="Daisy" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
            value={title} onChange={e => setTitle(e.target.value)} placeholder="My awesome post" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover image (optional)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-stone-200 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-rose-300 transition overflow-hidden"
          >
            {coverPreview
              ? <img src={coverPreview} alt="cover preview" className="h-full w-full object-cover" />
              : <span className="text-stone-400">{uploading ? 'Uploading...' : 'Click to upload'}</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 h-52 resize-none"
            value={content} onChange={e => setContent(e.target.value)} placeholder="Write your story..." required
          />
        </div>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition disabled:opacity-50"
        >
          {submitting ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}
