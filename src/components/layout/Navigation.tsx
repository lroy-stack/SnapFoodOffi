import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Map, Compass, Upload, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const { t } = useTranslation();

  // Enhanced active link style
  const activeClassName = "flex flex-col items-center text-sm font-medium text-red-600 relative after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-red-600 after:rounded-full";
  const inactiveClassName = "flex flex-col items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-3.5">
          <NavLink 
            to="/discover" 
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            <Compass size={24} />
            <span>{t('navigation.discover')}</span>
          </NavLink>
          
          <NavLink 
            to="/map" 
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            <Map size={24} />
            <span>{t('navigation.map')}</span>
          </NavLink>
          
          <NavLink 
            to="/upload" 
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            <Upload size={24} />
            <span>{t('navigation.upload')}</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
          >
            <User size={24} />
            <span>{t('navigation.profile')}</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
