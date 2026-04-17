'use client';

import { useRouter } from 'next/navigation';

interface HeaderNavProps {
  hasActiveSession: boolean;
}

export default function HeaderNav(props: HeaderNavProps) {
  // const location = usePathname();
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  // const isActive = (path: string) => {
  //   return location === path;
  // };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg"></div>
            <h1 className="text-xl font-semibold dark:text-white">
              Theme Park Planner
            </h1>
          </div>

          {props.hasActiveSession && (
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-2">
                <button onClick={() => navigate('/trips')}>My Trips</button>
                <button onClick={() => navigate('/profile')}>Account</button>
                <button onClick={() => navigate('/logout')}>Logout</button>
              </nav>
            </div>
          )}

          {!props.hasActiveSession && (
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-2">
                <button onClick={() => navigate('/login')}>Login</button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
