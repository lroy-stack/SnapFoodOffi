import { useState, useEffect } from 'react';
import { Dish } from '../types';
import { dishService, DishFilter } from '../services/DishService';

interface UseDishesResult {
  dishes: Dish[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  filter: DishFilter;
  setFilter: (filter: DishFilter) => void;
  refreshDishes: () => Promise<void>;
}

export const useDishes = (initialFilter: DishFilter = {}): UseDishesResult => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<DishFilter>(initialFilter);

  const fetchDishes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, count } = await dishService.getAllDishes(filter, page);
      setDishes(data);
      setTotalCount(count);
    } catch (err: any) {
      console.error('Error fetching dishes:', err);
      setError('Error fetching dishes: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dishes when filter or page changes
  useEffect(() => {
    fetchDishes();
  }, [filter, page]);

  const refreshDishes = async () => {
    await fetchDishes();
  };

  return {
    dishes,
    totalCount,
    isLoading,
    error,
    page,
    setPage,
    filter,
    setFilter,
    refreshDishes
  };
};

export default useDishes;