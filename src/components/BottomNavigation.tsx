
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckSquare, FileText, Bell, Image, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: CheckSquare, label: 'Задачи' },
    { path: '/notes', icon: FileText, label: 'Бележки' },
    { path: '/alarms', icon: Bell, label: 'Аларми' },
    { path: '/gallery', icon: Image, label: 'Галерия' },
    { path: '/more', icon: Menu, label: 'Още' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around z-50">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          className={cn(
            "bottom-nav-item",
            location.pathname === item.path && "active"
          )}
        >
          <item.icon 
            size={24} 
            className={cn(
              "mb-1",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )} 
          />
          <span className={location.pathname === item.path ? "text-primary" : "text-muted-foreground"}>
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNavigation;
