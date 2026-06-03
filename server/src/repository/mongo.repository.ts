import mongoose, { Schema, Document, Model } from 'mongoose';
import { IRepository, Post, Reaction, Comment } from './interface';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const PostSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  author:      { type: String, required: true },
  title:       { type: String, required: true },
  content:     { type: String, required: true },
  cover_image: { type: String },
  created_at:  { type: String, required: true },
});

const ReactionSchema = new Schema({
  id:         { type: String, required: true, unique: true },
  post_id:    { type: String, required: true, index: true },
  type:       { type: String, required: true },
  reactor:    { type: String, required: true },
  created_at: { type: String, required: true },
});

const CommentSchema = new Schema({
  id:         { type: String, required: true, unique: true },
  post_id:    { type: String, required: true, index: true },
  parent_id:  { type: String },
  author:     { type: String, required: true },
  content:    { type: String, required: true },
  image:      { type: String },
  created_at: { type: String, required: true },
});

// ─── Models ──────────────────────────────────────────────────────────────────

const PostModel: Model<Post & Document>     = mongoose.models.Post     ?? mongoose.model('Post',     PostSchema);
const ReactionModel: Model<Reaction & Document> = mongoose.models.Reaction ?? mongoose.model('Reaction', ReactionSchema);
const CommentModel: Model<Comment & Document>   = mongoose.models.Comment  ?? mongoose.model('Comment',  CommentSchema);

// ─── Implementation ──────────────────────────────────────────────────────────

export class MongoRepository implements IRepository {
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  async connect(): Promise<void> {
    await mongoose.connect(this.uri);
    console.log('MongoDB connected');
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return PostModel.find().sort({ created_at: -1 }).lean<Post[]>();
  }

  async getPost(id: string): Promise<Post | null> {
    return PostModel.findOne({ id }).lean<Post>();
  }

  async addPost(post: Post): Promise<void> {
    await PostModel.create(post);
  }

  async deletePost(id: string): Promise<void> {
    await Promise.all([
      PostModel.deleteOne({ id }),
      ReactionModel.deleteMany({ post_id: id }),
      CommentModel.deleteMany({ post_id: id }),
    ]);
  }

  // Reactions
  async getReactions(postId: string): Promise<Reaction[]> {
    return ReactionModel.find({ post_id: postId }).lean<Reaction[]>();
  }

  async findReaction(postId: string, reactor: string, type: string): Promise<Reaction | null> {
    return ReactionModel.findOne({ post_id: postId, reactor, type }).lean<Reaction>();
  }

  async addReaction(reaction: Reaction): Promise<void> {
    await ReactionModel.create(reaction);
  }

  async removeReaction(id: string): Promise<void> {
    await ReactionModel.deleteOne({ id });
  }

  async clearReactionsBy(postId: string, reactor: string): Promise<void> {
    await ReactionModel.deleteMany({ post_id: postId, reactor });
  }

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    return CommentModel.find({ post_id: postId }).sort({ created_at: 1 }).lean<Comment[]>();
  }

  async addComment(comment: Comment): Promise<void> {
    await CommentModel.create(comment);
  }
}
