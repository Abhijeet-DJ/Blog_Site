import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-rose-500 font-serif tracking-wide">
          Daisy Blog
        </Link>
        <Link
          to="/new"
          className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-rose-600 transition"
        >
          + New Post
        </Link>
      </div>
    </nav>
  );
}
