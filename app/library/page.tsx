"use client";
import React, { useEffect, useState } from 'react';
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from 'next/link';
import { BookOpen, Lock, Globe, PlusCircle } from 'lucide-react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLibraryContent(currentUser.uid, activeTab);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const fetchLibraryContent = async (userId: string, type: 'private' | 'public') => {
    setLoading(true);
    try {
      let q;
      if (type === 'private') {
        // यहाँ हम वो पोस्ट लाएंगे जो सिर्फ इस यूजर ने बनाई हैं (Private)
        q = query(
          collection(db, "posts"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        // पब्लिक सेव की गई पोस्ट्स के लिए (अभी के लिए ये खाली रहेगा या बुकमार्क लॉजिक लगेगा)
        // भविष्य में हम यहाँ 'saved_posts' कलेक्शन का इस्तेमाल करेंगे
        q = query(
          collection(db, "saved_posts"),
          where("userId", "==", userId),
          orderBy("savedAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (error) {
      console.error("Library Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1a1a1a] pb-24">
      {/* 1. Elegant Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-serif font-black text-black flex items-center gap-2">
          <BookOpen className="text-blue-600" /> My Library
        </h1>
        <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-bold">Aapka Vyaktigat Sangrah</p>
      </header>

      {/* 2. Professional Tab Switcher */}
      <div className="px-6 mb-8">
        <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setActiveTab('private')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'private' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            <Lock size={14} /> Private
          </button>
          <button 
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'public' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            <Globe size={14} /> Public
          </button>
        </div>
      </div>

      {/* 3. Content Area */}
      <div className="px-6 space-y-6">
        {loading ? (
          <div className="py-20 text-center font-serif italic text-gray-300 animate-pulse">Pustakein dhund rahe hain...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center">
            <p className="text-gray-300 font-serif italic mb-4">Is jagah abhi koi vichar nahi hai.</p>
            {activeTab === 'private' && (
              <Link href="/create" className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <PlusCircle size={14} /> Add First Inspiration
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Link href={`/read/${post.id}`} key={post.id}>
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 active:scale-95 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black uppercase tracking-tighter text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                      {post.category || "General"}
                    </span>
                    <span className="text-[10px] text-gray-300 font-serif italic">
                      {activeTab === 'private' ? '🔒 Private' : '🌍 Saved'}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-gray-900 leading-tight mb-2">{post.title}</h2>
                  <p className="text-gray-400 text-sm font-serif line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
