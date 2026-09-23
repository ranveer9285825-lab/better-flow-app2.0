import Link from 'next/link';

export default function ExplorePage() {
  return (
      <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center p-6 text-center pb-24">
            
                  {/* Premium Message Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 max-w-sm w-full relative overflow-hidden">
                                
                                        {/* Background Design Element */}
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-bl-full opacity-10"></div>

                                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-inner">
                                                                  🚀
                                                                          </div>
                                                                                  
                                                                                          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                                                                                                    Welcome to Waitlist!
                                                                                                            </h1>
                                                                                                                    
                                                                                                                            <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                                                                                                                                      <span className="text-gray-800 font-bold">Better Flow</span> is not the final app. This is an exclusive waiting list and preview for our upcoming mega-app: <br/>
                                                                                                                                                <span className="text-blue-600 text-2xl font-black tracking-wider block mt-2">LOREO</span>
                                                                                                                                                        </p>

                                                                                                                                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                                                                                                                                                                          <p className="text-blue-800 text-xs font-bold uppercase tracking-wider">
                                                                                                                                                                                      Stay tuned! Loreo is coming soon.
                                                                                                                                                                                                </p>
                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                {/* Dummy Waitlist Button - Filaal Home par redirect karega */}
                                                                                                                                                                                                                        <Link href="/">
                                                                                                                                                                                                                                  <button className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
                                                                                                                                                                                                                                              Keep Exploring
                                                                                                                                                                                                                                                        </button>
                                                                                                                                                                                                                                                                </Link>
                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                  