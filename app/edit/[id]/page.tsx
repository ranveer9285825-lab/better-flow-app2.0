"use client";
import React, { useEffect, useState } from 'react';
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from 'lucide-react';

export default function EditPostPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "posts", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !description) return alert("Title aur Description zaroori hain!");
    setSaving(true);
    try {
      const docRef = doc(db, "posts", id as string);
      await updateDoc(docRef, {
        title: title,
        description: description,
        updatedAt: new Date()
      });
      router.back(); // Update ke baad wapas profile par le jayega
    } catch (error) {
      console.error(error);
      alert("Update fail ho gaya!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-serif italic text-gray-800">Panna khul raha hai...</div>;

  return (
    <div className="fixed inset-0 bg-[#E8E4D9] z-[70] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Top Buttons */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[80]">
        <button 
          onClick={() => router.back()}
          className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase flex items-center gap-2"
        >
          <X size={14}/> Exit
        </button>
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="text-[10px] font-black tracking-[0.3em] text-blue-600 uppercase flex items-center gap-2"
        >
          {saving ? "Saving..." : <><Check size={14}/> Save</>}
        </button>
      </div>

      {/* The Elevated Paper */}
      <div className="relative w-[92%] h-[85vh] flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full bg-[#FDFCF0] shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-sm flex flex-col p-5 relative overflow-hidden border border-black/5"
        >
          {/* Page Grain Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-2 pt-8">
            {/* Title Input */}
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title yahan likhein..."
              className="w-full bg-transparent text-center text-3xl font-serif font-black text-black leading-tight mb-8 outline-none placeholder:text-gray-200"
            />
            
            <div className="w-12 h-[2px] bg-blue-600 mx-auto mb-10"></div>

            {/* Content Textarea */}
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Apni kahani ko yahan mita kar naya roop dein..."
              rows={15}
              className="w-full bg-transparent font-serif text-[20px] leading-[1.8] text-gray-900 text-justify outline-none resize-none no-scrollbar placeholder:text-gray-200"
            />

            {/* Bottom Watermark */}
            <div className="flex flex-col items-center mt-20 mb-10 opacity-30">
               <span className="text-4xl text-gray-400">◇</span>
               <div className="w-20 h-[1px] bg-gray-300 mt-2"></div>
               <span className="text-[10px] tracking-[0.4em] mt-3 uppercase font-serif text-gray-500">Edit Mode</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
