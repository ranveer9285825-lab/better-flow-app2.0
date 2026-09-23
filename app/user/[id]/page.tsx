"use client";
import React, { useEffect, useState, use } from 'react';
import { db, auth } from "@/lib/firebase";
import { 
  doc, getDoc, collection, query, where, onSnapshot, 
  setDoc, deleteDoc, addDoc, serverTimestamp, updateDoc, increment 
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Send, X, User, Eye, Moon, Sun } from 'lucide-react';

export default function ReaderPage() {
  const params = useParams();
  const id = params?.id; // URL से ID निकालना
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  // 1. Auth & Data Fetching
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    
    const fetchPost = async () => {
      if (!id) {
        console.error("No ID found in URL");
        return;
      }
      try {
        const docRef = doc(db, "posts", String(id));
        
        // Views badhana
        updateDoc(docRef, { view_count: increment(1) }).catch(() => {
           setDoc(docRef, { view_count: 1 }, { merge: true });
        });

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost(data);
          // 17px font ke liye shabdon ko divide karna
          const words = (data.description || "").split(/\s+/);
          const wordsPerPage = 150; 
          const dividedPages = [];
          for (let i = 0; i < words.length; i += wordsPerPage) {
            dividedPages.push(words.slice(i, i + wordsPerPage).join(" "));
          }
          setPages(dividedPages);
        } else {
          console.error("Post not found in Firebase!");
        }
      } catch (error) { 
        console.error("Firebase Error:", error); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchPost();
    return () => unsubAuth();
  }, [id]);

  // 2. Real-time Listeners
  useEffect(() => {
    if (!id) return;
    const qLikes = query(collection(db, "likes"), where("postId", "==", id));
    const unsubLikes = onSnapshot(qLikes, (snap) => {
      setLikesCount(snap.size);
      if (currentUser) {
        setIsLiked(snap.docs.some(doc => doc.id === `${currentUser.uid}_${id}`));
      }
    });

    const qComments = query(collection(db, "comments"), where("postId", "==", id));
    const unsubComments = onSnapshot(qComments, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setComments(fetched);
    });

    return () => { unsubLikes(); unsubComments(); };
  }, [id, currentUser]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    try {
      await addDoc(collection(db, "comments"), {
        postId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Yatri",
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment("");
    } catch (err) { alert("Comment post fail!"); }
  };

  if (loading) return <div className="fixed inset-0 flex items-center justify-center bg-white text-gray-400 font-serif italic">Kahani saj rahi hai...</div>;
  if (!post) return <div className="fixed inset-0 flex items-center justify-center bg-white text-red-500">Post nahi mila! ID check karein.</div>;

  return (
    <div className={`fixed inset-0 z-[70] flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#121212]' : 'bg-[#E8E4D9]'}`}>
      
      {/* Header Bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[80]">
        <button onClick={() => router.back()} className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>← Back</button>
        <div className="flex gap-5 items-center">
          <button onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-400" />}</button>
          <div className="flex items-center gap-1"><Eye size={18} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-400">{post?.view_count || 0}</span></div>
          <button onClick={() => setShowComments(true)} className="flex items-center gap-1"><MessageSquare size={18} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-400">{comments.length}</span></button>
        </div>
      </div>

      {/* Reader Page Container */}
      <div className="relative w-[94%] h-[82vh]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            className={`w-full h-full p-6 rounded-sm shadow-2xl flex flex-col relative border ${isDarkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-[#FDFCF0] border-black/5'}`}
          >
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {currentPage === 0 && <h1 className={`text-2xl font-serif font-black mb-8 leading-tight uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>{post?.title}</h1>}
              {/* Text Size Fixed at 17px for 8-9 words per line */}
              <div className={`font-serif text-[17px] leading-[1.9] text-justify ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                {pages[currentPage]?.split("\n").map((p, i) => <p key={i} className="mb-5">{p}</p>)}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className={`mt-4 pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <button onClick={() => setCurrentPage(c => Math.max(0, c-1))} className={`text-[10px] font-bold ${currentPage === 0 ? 'text-gray-600' : 'text-blue-600'}`}>PREV</button>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest">Page {currentPage + 1} / {pages.length}</span>
              <button onClick={() => setCurrentPage(c => Math.min(pages.length-1, c+1))} className={`text-[10px] font-bold ${currentPage === pages.length - 1 ? 'text-gray-600' : 'text-blue-600'}`}>NEXT</button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Click zones for mobile navigation */}
      <div className="absolute inset-y-0 left-0 w-1/5 z-10" onClick={() => setCurrentPage(c => Math.max(0, c-1))}></div>
      <div className="absolute inset-y-0 right-0 w-1/5 z-10" onClick={() => setCurrentPage(c => Math.min(pages.length-1, c+1))}></div>

      {/* Sidebar (Comments) */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white z-[100] flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center text-black">
              <h3 className="font-black text-xs tracking-[0.2em]">COMMENTS</h3>
              <button onClick={() => setShowComments(false)}><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {comments.map(c => (
                <div key={c.id} className="border-l-2 border-blue-100 pl-4 py-1">
                  <span className="font-black text-[10px] text-blue-600 uppercase block mb-1">{c.userName}</span>
                  <p className="text-gray-700 text-sm font-serif leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="p-6 border-t bg-gray-50 flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Likhein..." className="flex-1 bg-white border rounded-xl px-4 py-3 text-sm text-black outline-none" />
              <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl"><Send size={18}/></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
