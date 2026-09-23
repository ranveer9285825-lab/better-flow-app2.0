"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function ReadPage() {
  // यह कोड थीम बदलने का काम करेगा (डार्क या किताब वाला)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // असली किताब वाला डिज़ाइन (हल्का पीलापन + कागज के रेशे)
  const bookStyle = {
    backgroundColor: '#f4ecd8', 
    color: '#2c1b0a', 
    backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` 
  };

  // डार्क मोड का डिज़ाइन
  const darkStyle = {
    backgroundColor: '#121212',
    color: '#e0e0e0',
  };

  return (
    <div 
      className="min-h-screen pb-20 transition-colors duration-500"
      style={isDarkMode ? darkStyle : bookStyle}
    >
      
      {/* ऊपर का नेविगेशन बार */}
      <div 
        className="flex justify-between items-center p-4 shadow-sm sticky top-0 transition-colors duration-500 z-10" 
        style={isDarkMode ? { backgroundColor: '#1e1e1e', borderBottom: '1px solid #333' } : { backgroundColor: '#f4ecd8', backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`, borderBottom: '1px solid #e6d9be' }}
      >
        <Link href="/" className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} font-medium`}>← Back</Link>
        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The Psychology of Money</span>
        
        {/* थीम बदलने वाला बटन (चांद / सूरज) */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full text-xl shadow-md transition-transform active:scale-90 ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'}`}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* पढ़ने वाला कंटेंट */}
      <div className="p-6 text-lg leading-relaxed font-serif">
        <h1 className="text-2xl font-bold mb-8 text-center">Chapter 4: Confounding Compounding</h1>
        
        <p className="mb-6">
          If I ask you to calculate 8+8+8+8+8+8+8+8+8, you can do it in a few seconds (it’s 72). But if I ask you to calculate 8x8x8x8x8x8x8x8x8, your head will explode (it’s 134,217,728).
        </p>
        <p className="mb-6">
          Warren Buffett’s net worth is $84.5 billion. Of that, $84.2 billion was accumulated after his 50th birthday.
        </p>
        <p className="mb-6">
          His skill is investing, but his secret is time. That’s how compounding works.
        </p>
        <p className="mb-6">
          Good investing isn’t necessarily about earning the highest returns, because the highest returns tend to be one-off hits that can’t be repeated. It’s about earning pretty good returns that you can stick with and which can be repeated for the longest period of time.
        </p>
        
        <div className="mt-10 flex justify-center">
          <button className={`px-8 py-3 rounded-full text-sm font-bold shadow-sm transition ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-[#e6d9be] text-[#2c1b0a] hover:bg-[#d8c8a9]'}`}>
            Next Part →
          </button>
        </div>
      </div>
      
    </div>
  );
}
