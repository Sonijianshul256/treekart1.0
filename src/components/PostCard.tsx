import { Heart, MessageCircle } from 'lucide-react';
import type { Post } from '@/types';
import { formatDate } from '@/utils/dates';

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded border border-grove-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img src={post.userAvatar || 'https://api.dicebear.com/8.x/initials/svg?seed=Treekart'} alt="" className="h-10 w-10 rounded-full" />
        <div>
          <h3 className="font-semibold text-ink">{post.userName || 'Treekart member'}</h3>
          <p className="text-xs text-grove-700">{post.type.replace('_', ' ')} · {formatDate(post.timestamp)}</p>
        </div>
      </div>
      {post.imageUrl && <img src={post.imageUrl} alt="" className="mt-4 max-h-[420px] w-full rounded object-cover" />}
      <p className="mt-4 text-ink">{post.caption}</p>
      <div className="mt-4 flex items-center gap-5 text-sm text-grove-700">
        <button className="flex items-center gap-1"><Heart size={17} /> {post.likes}</button>
        <span className="flex items-center gap-1"><MessageCircle size={17} /> {post.comments?.length || 0}</span>
      </div>
      <div className="mt-3 space-y-2 border-t border-grove-100 pt-3">
        {(post.comments || []).slice(0, 3).map((comment, index) => (
          <p key={`${comment.userId}-${index}`} className="rounded bg-grove-50 px-3 py-2 text-sm text-ink">{comment.text}</p>
        ))}
        <input className="w-full rounded border border-grove-100 px-3 py-2 text-sm" placeholder="Write a comment" />
      </div>
    </article>
  );
}
