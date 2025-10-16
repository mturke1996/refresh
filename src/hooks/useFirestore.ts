import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Real-time Firestore collection hook
 */
export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints)
      : collectionRef;

    const unsubscribe = onSnapshot(
      q as Query<DocumentData>,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

/**
 * Hook to get active categories
 */
export function useCategories() {
  return useCollection('categories', [
    where('active', '==', true),
    orderBy('order', 'asc'),
  ]);
}

/**
 * Hook to get menu items
 */
export function useMenuItems(categoryId?: string) {
  const constraints: QueryConstraint[] = [where('available', '==', true)];
  
  if (categoryId) {
    constraints.push(where('categoryId', '==', categoryId));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  
  return useCollection('items', constraints);
}

/**
 * Hook to get featured items (offers/new)
 */
export function useFeaturedItems(type: 'offer' | 'new') {
  const field = type === 'offer' ? 'isOnOffer' : 'isNew';
  
  return useCollection('items', [
    where('available', '==', true),
    where(field, '==', true),
    orderBy('createdAt', 'desc'),
  ]);
}

