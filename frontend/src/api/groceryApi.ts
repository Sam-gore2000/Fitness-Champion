import api from './client';
import type { GroceryList } from '@/types';

export const groceryApi = {
  generate: () => api.post<{ groceryList: GroceryList }>('/grocery/generate'),
  list: () => api.get<{ groceryLists: GroceryList[] }>('/grocery'),
  toggleItem: (listId: string, itemIndex: number) => api.patch(`/grocery/${listId}/items/${itemIndex}`),
};
