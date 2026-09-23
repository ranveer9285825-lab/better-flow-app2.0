"use client";
import React, { useState } from 'react';
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ChevronDown, BookText, Tag } from 'lucide-react'; // आइकन्स का इस्तेमाल

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Entertainment"); // Default category
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const categories = [
    "Entertainment", "Business", "Finance", "Horror", 
    "Education", "Politics", "Romance", "Tech", "Lifestyle"
  ];

  const handleSave = async () => {
    if (!title || !description) return alert("Title and Description are required!");
    if (!auth.currentUser) return alert("Please login first!");

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        title,
        description,
        category, // कैटेगरी अब डेटाबेस में सेव होगी
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      alert("Chapter Saved Successfully!");
      router.push("/"); // होम पेज पर वापस भेजें
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C2C2C] pb-24 px-6 pt-12">
      <div className="max-w-xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-black flex items-center gap-2">
            <BookText className="text-blue-600" /> Write New Chapter
          </h1>
          <p className="text-gray-400 text-sm mt-1 italic font-serif">Aapke vicharon ko panno par utarein...</p>
        </header>

        {/* Form Section */}
        <div className="space-y-6">
          
          {/* 1. Category Selector (Professional Touch) */}
          <div className="relative">
            <label className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2 block flex items-center gap-1">
              <Tag size={12} /> Choose Category
            </label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 appearance-none font-serif focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-gray-700 shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* 2. Title Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Chapter Title</label>
            <input 
              type="text"
              placeholder="Enter a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-100 py-2 text-2xl font-serif font-bold focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-200"
            />
          </div>

          {/* 3. Description (Content) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">The Story / Content</label>
            <textarea 
              placeholder="Start writing your thoughts here..."
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm placeholder:text-gray-300"
            />
          </div>

          {/* 4. Save Button */}
          <button 
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {loading ? "Saving to Library..." : "Publish to Better Flow"}
          </button>

        </div>
      </div>
    </div>
  );
}
