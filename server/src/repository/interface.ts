// ─── Domain types ────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  cover_image?: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  type: string;
  reactor: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  author: string;
  content: string;
  image?: string;
  created_at: string;
}

// ─── Repository contract ─────────────────────────────────────────────────────
// Every database adapter must implement this interface.
// Routes depend only on IRepository — never on a concrete driver.

export interface IRepository {
  /** Lifecycle */
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  /** Posts */
  getPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | null>;
  addPost(post: Post): Promise<void>;
  deletePost(id: string): Promise<void>;

  /** Reactions */
  getReactions(postId: string): Promise<Reaction[]>;
  findReaction(postId: string, reactor: string, type: string): Promise<Reaction | null>;
  addReaction(reaction: Reaction): Promise<void>;
  removeReaction(id: string): Promise<void>;
  /** Remove all reactions a reactor has left on a post (used for toggle-switch). */
  clearReactionsBy(postId: string, reactor: string): Promise<void>;

  /** Comments */
  getComments(postId: string): Promise<Comment[]>;
  addComment(comment: Comment): Promise<void>;
}
