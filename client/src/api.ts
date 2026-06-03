import axios from 'axios';
import type { Post, Comment, Reaction } from './types';

const api = axios.create({ baseURL: '/api' });

export const getPosts = () => api.get<Post[]>('/posts').then(r => r.data);
export const getPost = (id: string) => api.get<Post>(`/posts/${id}`).then(r => r.data);
export const createPost = (data: { author: string; title: string; content: string; cover_image?: string }) =>
  api.post<Post>('/posts', data).then(r => r.data);

export const getComments = (postId: string) => api.get<Comment[]>(`/comments/${postId}`).then(r => r.data);
export const addComment = (postId: string, data: { author: string; content: string; parent_id?: string; image?: string }) =>
  api.post<Comment>(`/comments/${postId}`, data).then(r => r.data);

export const toggleReaction = (postId: string, type: string, reactor: string) =>
  api.post<{ toggled: string; type?: string }>(`/reactions/${postId}`, { type, reactor }).then(r => r.data);
export const getReactions = (postId: string) => api.get<Reaction[]>(`/reactions/${postId}`).then(r => r.data);

export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('image', file);
  const res = await axios.post<{ url: string }>('/api/upload', form);
  return res.data.url;
};
