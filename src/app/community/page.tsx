"use client";

import { FormEvent, useState } from 'react';
import { ImagePlus, Send } from 'lucide-react';
import { Button } from '@/components/Button';
import { PostCard } from '@/components/PostCard';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/hooks/useFirestore';
import { createPost } from '@/services/firestore';

export default function CommunityPage() {
  const { profile } = useAuth();
  const { data: posts = [], refetch } = usePosts();
  const [caption, setCaption] = useState('');
  const [type, setType] = useState<'harvest_share' | 'recipe' | 'challenge'>('harvest_share');
  const [file, setFile] = useState<File | undefined>();

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createPost(profile!.uid, { caption, type }, file);
    setCaption('');
    setFile(undefined);
    refetch();
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
      <aside>
        <form onSubmit={submit} className="sticky top-24 rounded border border-grove-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black text-ink">Community feed</h1>
          <textarea required value={caption} onChange={(event) => setCaption(event.target.value)} className="mt-4 h-32 w-full rounded border border-grove-100 px-3 py-2" placeholder="Share your harvest, recipe, or challenge update" />
          <select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="mt-3 w-full rounded border border-grove-100 px-3 py-2">
            <option value="harvest_share">Harvest share</option>
            <option value="recipe">Recipe</option>
            <option value="challenge">Challenge</option>
          </select>
          <label className="mt-3 flex cursor-pointer items-center gap-2 rounded border border-dashed border-grove-100 p-3 text-sm text-grove-700">
            <ImagePlus size={18} />
            {file?.name || 'Upload image'}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0])} />
          </label>
          <Button className="mt-4 w-full"><Send size={16} /> Post</Button>
        </form>
      </aside>
      <section className="space-y-4">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </section>
    </main>
  );
}
