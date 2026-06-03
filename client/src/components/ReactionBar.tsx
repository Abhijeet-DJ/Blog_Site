import { useState, useEffect } from 'react';
import { toggleReaction, getReactions } from '../api';
import type { Reaction } from '../types';

const REACTIONS = [
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'haha', emoji: '😂' },
  { type: 'wow', emoji: '😮' },
  { type: 'sad', emoji: '😢' },
  { type: 'angry', emoji: '😠' },
];

const getReactor = () => {
  let name = localStorage.getItem('reactor_name');
  if (!name) {
    name = 'User_' + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('reactor_name', name);
  }
  return name;
};

export default function ReactionBar({ postId }: { postId: string }) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [myReaction, setMyReaction] = useState<string | null>(null);

  const refresh = () => getReactions(postId).then(setReactions);

  useEffect(() => { refresh(); }, [postId]);

  const handleReact = async (type: string) => {
    const reactor = getReactor();
    await toggleReaction(postId, type, reactor);
    setMyReaction(prev => prev === type ? null : type);
    refresh();
  };

  const countFor = (type: string) => reactions.find(r => r.type === type)?.count ?? 0;

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {REACTIONS.map(r => (
        <button
          key={r.type}
          onClick={() => handleReact(r.type)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition ${
            myReaction === r.type
              ? 'bg-rose-100 border-rose-300 text-rose-600 font-semibold'
              : 'bg-white border-stone-200 hover:bg-stone-50'
          }`}
        >
          <span>{r.emoji}</span>
          {countFor(r.type) > 0 && <span>{countFor(r.type)}</span>}
        </button>
      ))}
    </div>
  );
}
