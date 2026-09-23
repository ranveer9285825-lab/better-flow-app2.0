"use client";
import React, { useEffect, useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, limit, doc, getDoc } from "firebase/firestore";
import Link from 'next/link';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 1. Splash Screen Component (Wave Motion)
const SplashScreen = () => (
  <div className="fixed inset-0 z-[100] bg-[#0A0C10] flex flex-col items-center justify-center">
    <div className="relative w-48 h-48 flex items-center justify-center">
      <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full"></div>
      <motion.svg 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" /><stop offset="50%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
        </defs>
        <path d="M40 110C60 90 90 85 120 105C150 125 170 110 180 100C160 120 130 135 100 125C70 115 50 120 40 110Z" fill="url(#waveGrad)" fillOpacity="0.4" />
        <path d="M30 100C55 75 95 75 125 95C155 115 175 105 185 90C165 115 130 125 100 110C70 95 45 105 30 100Z" fill="url(#waveGrad)" fillOpacity="0.7" />
        <path d="M20 90C50 60 100 60 130 85C160 110 185 100 195 80C175 110 135 120 100 100C65 80 40 95 20 90Z" fill="url(#waveGrad)" filter="url(#glow)" />
      </motion.svg>
    </div>
    <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-cyan-400 font-black tracking-[0.8em] text-[11px] uppercase ml-[0.8em]">Better Flow</motion.h2>
  </div>
);

const AuthorInfo = ({ userId }: { userId: string }) => {
  const [author, setAuthor] = useState<any>(null);
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setAuthor(docSnap.data());
      } catch (e) { console.error(e); }
    };
    fetchAuthor();
  }, [userId]);
  return (
    <Link href={`/user/${userId}`} className="flex items-center gap-2 mb-3 group">
      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
        {author?.profilePic ? <img src={author.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={12} /></div>}
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{author?.username || "..."}</span>
    </Link>
  );
};

export default function HomePage() {
  // 1. Splash State Fix: Start as true
  const [showSplash, setShowSplash] = useState(true);
  const [publicPosts, setPublicPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Entertainment", "Business", "Finance", "Horror", "Education", "Politics", "Romance", "Tech"];

  // Logic: Only show splash if not seen in this session
  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('splashShown');
    if (hasShownSplash) {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch Logic with proper filtering and error fallback
  useEffect(() => {
    if (showSplash) return; // Wait for splash to finish
    
    const fetchPosts = async () => {
      setLoading(true);
      setPublicPosts([]); // Clear old posts while loading new category
      try {
        let q;
        if (activeCategory === "All") {
          q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
        } else {
          // If this query fails in Firebase console, check "Indexes"
          q = query(collection(db, "posts"), where("category", "==", activeCategory), orderBy("createdAt", "desc"), limit(20));
        }
        
        const snap = await getDocs(q);
        setPublicPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.warn("Index not found, using fallback query...");
        // Fallback: If sorting + filtering fails, just filter without sorting
        const fallbackQ = query(collection(db, "posts"), where("category", "==", activeCategory), limit(20));
        const snap = await getDocs(fallbackQ);
        setPublicPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory, showSplash]);

  // Prevent Home Page from rendering even for a millisecond
  if (showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#333] pb-24">
      <div className="relative overflow-hidden bg-blue-600 h-32 flex items-center px-6">
        <div className="absolute top-0 right-0 w-32 h-full bg-blue-500 transform skew-x-12 translate-x-16 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-white text-3xl font-serif font-bold italic tracking-tighter">Better Flow</h1>
        </div>
      </div>

      {/* Category Bar */}
      <div className="sticky top-0 z-30 bg-[#F5F5F3]/90 backdrop-blur-md py-4 overflow-x-auto no-scrollbar flex gap-2 px-5 border-b border-gray-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${
              activeCategory === cat ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post Feed */}
      <div className="px-5 mt-6">
        {loading ? (
          <div className="p-20 text-center font-serif italic text-gray-400">Panna palat rahe hain...</div>
        ) : publicPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-serif text-sm italic">Is category mein koi chapter nahi mila.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {publicPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 active:scale-[0.98] transition-all relative overflow-hidden">
                <AuthorInfo userId={post.userId} />
                <Link href={`/read/${post.id}`}>
                  <span className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                    {post.category}
                  </span>
                  <div className="border-l-2 border-blue-400 pl-4">
                    <h2 className="text-lg font-serif font-bold text-gray-900 mb-1 leading-tight">{post.title}</h2>
                    <p className="text-gray-500 font-serif text-xs line-clamp-2 leading-relaxed italic">{post.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
