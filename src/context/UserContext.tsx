import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, Badge } from '../types';

// Mock badges for demonstration
const mockBadges: Badge[] = [
  {
    id: 'first-photo',
    nameDE: 'Erster Schnappschuss',
    nameEN: 'First Snap',
    descriptionDE: 'Dein erstes Foto hochgeladen',
    descriptionEN: 'Uploaded your first photo',
    iconUrl: '/badges/first-snap.svg',
    category: 'fotografie',
    levelRequired: 1
  },
  {
    id: 'good-foodie',
    nameDE: 'Guter Foodie',
    nameEN: 'Good Foodie',
    descriptionDE: 'Mehr als 5 Bewertungen abgegeben',
    descriptionEN: 'Submitted more than 5 ratings',
    iconUrl: '/badges/good-foodie.svg',
    category: 'bewertungen',
    levelRequired: 2
  },
  {
    id: 'local-explorer',
    nameDE: 'Lokaler Entdecker',
    nameEN: 'Local Explorer',
    descriptionDE: 'Mehr als 3 Bezirke besucht',
    descriptionEN: 'Visited more than 3 districts',
    iconUrl: '/badges/local-explorer.svg',
    category: 'erkundung',
    levelRequired: 2
  }
];

// Demo user data
const demoUser: User = {
  id: 'user1',
  username: 'FoodieExplorer',
  level: 3,
  points: 100,
  badges: mockBadges,
  reviews: ['review1', 'review2'],
  uploads: ['upload1', 'upload2']
};

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  addPoints: (points: number) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  addPoints: () => {}
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // In a real app, this would check for an auth token and fetch user data
    const localUser = localStorage.getItem('user');
    if (localUser) {
      setUser(JSON.parse(localUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = () => {
    // For demo purposes, just set the demo user
    setUser(demoUser);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };

  const addPoints = (points: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        points: user.points + points
      };
      
      // Update level based on points
      if (updatedUser.points < 7) {
        updatedUser.level = 1; // Beginner
      } else if (updatedUser.points < 50) {
        updatedUser.level = 2; // Beginner Foodie
      } else if (updatedUser.points < 100) {
        updatedUser.level = 3; // Regular Foodie
      } else if (updatedUser.points < 250) {
        updatedUser.level = 4; // Featured Foodie
      } else if (updatedUser.points < 500) {
        updatedUser.level = 5; // Expert Foodie
      } else {
        updatedUser.level = 6; // Top Foodie
      }
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout, addPoints }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;