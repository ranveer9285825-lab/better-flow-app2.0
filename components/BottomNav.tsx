"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/' },
            { name: 'Explore', path: '/explore' },
                { name: 'Create', path: '/create' },
                    { name: 'Library', path: '/library' },
                        { name: 'Profile', path: '/profile' },
                          ];

                            return (
                                <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-200 shadow-lg pb-safe">
                                      <div className="flex justify-around items-center h-16">
                                              {navItems.map((item) => {
                                                        const isActive = pathname === item.path;
                                                                  return (
                                                                              <Link 
                                                                                            key={item.name} 
                                                                                                          href={item.path}
                                                                                                                        className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
                                                                                                                                        isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                                                                                                                                      }`}
                                                                                                                                                                  >
                                                                                                                                                                                <span>{item.name}</span>
                                                                                                                                                                                            </Link>
                                                                                                                                                                                                      );
                                                                                                                                                                                                              })}
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                          );
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                          