
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckSquare, BookText, AlarmClock, Images, MoreHorizontal, MessageSquare } from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center h-full w-full ${
            active === "/" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <CheckSquare size={24} />
          <span className="text-xs mt-1">Задачи</span>
        </Link>
        <Link
          to="/notes"
          className={`flex flex-col items-center justify-center h-full w-full ${
            active === "/notes" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <BookText size={24} />
          <span className="text-xs mt-1">Бележки</span>
        </Link>
        <Link
          to="/alarms"
          className={`flex flex-col items-center justify-center h-full w-full ${
            active === "/alarms" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <AlarmClock size={24} />
          <span className="text-xs mt-1">Аларми</span>
        </Link>
        <Link
          to="/gallery"
          className={`flex flex-col items-center justify-center h-full w-full ${
            active === "/gallery" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Images size={24} />
          <span className="text-xs mt-1">Галерия</span>
        </Link>
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center h-full w-full ${
            active === "/chat" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Чат</span>
        </Link>
        <Link
          to="/more"
          className={`flex flex-col items-center justify-center h-full w-full ${
            active === "/more" ? "text-teal-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <MoreHorizontal size={24} />
          <span className="text-xs mt-1">Още</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
