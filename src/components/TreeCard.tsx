import Link from 'next/link';
import { CalendarDays, Droplet, Leaf, ShieldAlert } from 'lucide-react';
import { Tree } from '@/types';
import { daysUntil } from '@/utils/dates';

export function TreeCard({ tree }: { tree: Tree }) {
  return (
    <Link href={`/tree/${tree.id}`} className="block min-w-[290px] rounded border border-grove-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <img
        src={tree.photoUrl || `https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80`}
        alt={`${tree.type} tree`}
        className="h-40 w-full rounded-t object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-grove-700">{tree.zone}</p>
            <h3 className="text-lg font-bold text-ink">{tree.userGivenName || `${tree.type} ${tree.row}`}</h3>
          </div>
          <span className="rounded bg-grove-100 px-2 py-1 text-xs font-semibold text-grove-700">{tree.type}</span>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-ink"><span>Growth stage</span><span>68%</span></div>
          <div className="h-2 rounded bg-grove-100"><div className="h-2 w-[68%] rounded bg-grove-700" /></div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-ink">
          <span className="flex items-center gap-1"><CalendarDays size={16} /> {daysUntil(tree.harvestMonth)} days</span>
          <span className="flex gap-2 text-grove-700"><Droplet size={17} /><Leaf size={17} /><ShieldAlert size={17} /></span>
        </div>
      </div>
    </Link>
  );
}
