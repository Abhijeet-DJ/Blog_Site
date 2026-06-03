export interface Reaction {
  type: string;
  count: number;
}

export interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  cover_image?: string;
  created_at: string;
  reactions: Reaction[];
  commentCount: number;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  author: string;
  content: string;
  image?: string;
  created_at: string;
  replies: Comment[];
}
