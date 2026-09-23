import BottomNav from '../components/BottomNav';
import './globals.css';

export const metadata = {
  title: 'Better Flow Reading App',
    description: 'Convert PDFs to readable books instantly',
    };

    export default function RootLayout({
      children,
      }: {
        children: React.ReactNode;
        }) {
          return (
              <html lang="en">
                    <body className="bg-gray-100 text-gray-900">
                            <div className="max-w-md mx-auto min-h-screen bg-white relative pb-16 shadow-xl overflow-x-hidden">
                                      <main>
                                                  {children}
                                                            </main>
                                                                      {/* यहाँ हमने BottomNav लगा दिया है जिससे बटन दिखेंगे */}
                                                                                <BottomNav />
                                                                                        </div>
                                                                                              </body>
                                                                                                  </html>
                                                                                                    );
                                                                                                    }
                                                                                                    