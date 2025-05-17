export type LanguageType = 'de' | 'en';

export interface Dish {
  id: string;
  nameDE: string;
  nameEN: string;
  descriptionDE: string;
  descriptionEN: string;
  category: 'hauptgericht' | 'nachspeise' | 'vorspeise' | 'getränk' | 'snack';
  imageUrl: string;
  origin: string;
  priceRange: 1 | 2 | 3;
  popularity: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  district: string;
  rating: number;
  priceRange: 1 | 2 | 3;
  coordinates: {
    lat: number;
    lng: number;
  };
  dishes: string[];
}

export interface Review {
  id: string;
  userId: string;
  dishId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  date: string;
}

export interface User {
  id: string;
  username: string;
  level: number;
  points: number;
  badges: Badge[];
  reviews: string[];
  uploads: string[];
}

export interface Badge {
  id: string;
  nameDE: string;
  nameEN: string;
  descriptionDE: string;
  descriptionEN: string;
  iconUrl: string;
  category: string;
  levelRequired: number;
}

export interface UserStats {
  userId: string;
  id?: string; // Para compatibilidad con la versión anterior
  points: number;
  level: number;
  badges?: Badge[]; // Para el servicio de respaldo
  badgeCount?: number; // Para el servicio de respaldo
  reviewsCount: number;
  commentsCount?: number; // Opcional para respaldo
  photosCount: number;
  visitedRestaurants?: number; // Opcional para respaldo
  districtsVisited?: number; // Para el servicio de respaldo
  triedDishes?: number; // Opcional para respaldo
  updatedAt?: string; // Opcional para respaldo
  nextLevelPoints?: number; // Para el servicio de respaldo
  progressPercentage?: number; // Para el servicio de respaldo
}

export type Activity = 
  | 'review'
  | 'comment'
  | 'photo'
  | 'share'
  | 'visit'
  | 'new_district';
