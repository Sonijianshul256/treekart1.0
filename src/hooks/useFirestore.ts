import { useQuery } from '@tanstack/react-query';
import {
  fetchDeliveries,
  fetchLatestUpdate,
  fetchPosts,
  fetchSubscriptions,
  fetchTree,
  fetchTreeUpdates,
  fetchTrees,
  fetchUserTrees,
  fetchVoiceNotes
} from '@/services/firestore';

export const useTrees = () => useQuery({ queryKey: ['trees'], queryFn: fetchTrees });
export const useTree = (treeId?: string) => useQuery({ queryKey: ['tree', treeId], queryFn: () => fetchTree(treeId!), enabled: Boolean(treeId) });
export const useUserTrees = (uid?: string) => useQuery({ queryKey: ['userTrees', uid], queryFn: () => fetchUserTrees(uid!), enabled: Boolean(uid) });
export const useLatestUpdate = (treeId?: string) =>
  useQuery({ queryKey: ['latestUpdate', treeId], queryFn: () => fetchLatestUpdate(treeId!), enabled: Boolean(treeId) });
export const useTreeUpdates = (treeId?: string) =>
  useQuery({ queryKey: ['treeUpdates', treeId], queryFn: () => fetchTreeUpdates(treeId!), enabled: Boolean(treeId) });
export const useSubscriptions = (uid?: string) =>
  useQuery({ queryKey: ['subscriptions', uid], queryFn: () => fetchSubscriptions(uid!), enabled: Boolean(uid) });
export const useDeliveries = (uid?: string) => useQuery({ queryKey: ['deliveries', uid], queryFn: () => fetchDeliveries(uid!), enabled: Boolean(uid) });
export const usePosts = () => useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
export const useVoiceNotes = (treeId?: string) =>
  useQuery({ queryKey: ['voiceNotes', treeId], queryFn: () => fetchVoiceNotes(treeId!), enabled: Boolean(treeId) });
