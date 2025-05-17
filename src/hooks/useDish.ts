import { useState, useEffect } from 'react';
import { Dish } from '../types';
import { dishService } from '../services/DishService';

interface UseDishResult {
  dish: Dish | null;
  relatedRestaurants: any[];
  isLoading: boolean;
  error: string | null;
  refreshDish: () => Promise<void>;
}

export const useDish = (dishId: string | undefined): UseDishResult => {
  const [dish, setDish] = useState<Dish | null>(null);
  const [relatedRestaurants, setRelatedRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDish = async () => {
    if (!dishId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dishData = await dishService.getDishById(dishId);
      setDish(dishData);

      // Fetch restaurants that serve this dish
      const restaurants = await dishService.getRestaurantsForDish(dishId);
      setRelatedRestaurants(restaurants);
    } catch (err) {
      setError('Failed to load dish details. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dish when dishId changes
  useEffect(() => {
    fetchDish();
  }, [dishId]);

  const refreshDish = async () => {
    await fetchDish();
  };

  return {
    dish,
    relatedRestaurants,
    isLoading,
    error,
    refreshDish
  };
};

export default useDish;