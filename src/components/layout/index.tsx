import React, { useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { usePokemonStore } from "../../store";

const Layout: React.FC = () => {
  const { darkMode, toggleDarkMode, myPokemon } = usePokemonStore();

  // On mount, make sure DOM matches store mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen w-full flex justify-center items-start transition-colors duration-300 ${
        darkMode ? "bg-mesh-dark" : "bg-mesh-light"
      } transition-theme`}
    >
      {/* Mobile Smartphone Frame Container */}
      <div className="w-full max-w-[450px] min-h-screen flex flex-col bg-white dark:bg-[#0b0c10] shadow-[0_0_50px_rgba(0,0,0,0.15)] md:border-x border-gray-200/20 dark:border-gray-800/20 pb-20 transition-theme relative">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 w-full glass-panel shadow-sm border-b border-gray-200/15 dark:border-gray-800/15">
          <div className="px-4 py-3 flex justify-between items-center">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 select-none group no-underline">
              <div className="relative w-7 h-7 flex items-center justify-center bg-red-500 rounded-full border-2 border-gray-900 shadow group-hover:rotate-12 transition-transform duration-300">
                <div className="absolute top-0 left-0 w-full h-[40%] bg-red-500 rounded-t-full"></div>
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white rounded-b-full"></div>
                <div className="w-full h-0.5 bg-gray-900 z-10"></div>
                <div className="absolute w-1.5 h-1.5 bg-white border border-gray-900 rounded-full z-20"></div>
              </div>
              <span className="font-sans font-extrabold text-base tracking-wider text-red-500 dark:text-red-400 group-hover:text-red-655 transition-colors">
                POKÉ<span className="text-gray-900 dark:text-white font-light">APP</span>
              </span>
            </NavLink>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-full border border-gray-300/40 dark:border-gray-700/40 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-indigo-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full px-4 pt-5 pb-6 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Sticky Bottom Navigation Bar aligned with mobile container */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[450px] glass-panel shadow-[0_-4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.15)] border-t border-gray-200/35 dark:border-gray-800/35 flex justify-around items-center py-2.5 px-6 transition-theme">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 no-underline transition-colors duration-200 select-none ${
                isActive ? "text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-400"
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide uppercase">Home</span>
          </NavLink>

          <NavLink
            to="/my-pokemon"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 no-underline transition-colors duration-200 select-none relative ${
                isActive ? "text-red-500" : "text-gray-600 dark:text-gray-300 hover:text-red-400"
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide uppercase">Bag</span>
            {myPokemon.length > 0 && (
              <span className="absolute -top-1 -right-4 w-4 h-4 flex items-center justify-center text-[8px] font-extrabold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full border border-white dark:border-gray-950">
                {myPokemon.length}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
