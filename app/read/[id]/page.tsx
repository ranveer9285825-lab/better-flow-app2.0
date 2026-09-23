"use client";
import React, { useEffect, useState } from 'react';
import { db, auth } from "@/lib/firebase";
import {
  doc, getDoc, collection, query, where, onSnapshot,
  setDoc, deleteDoc, addDoc, serverTimestamp, updateDoc, increment
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Send, X, Eye, Moon, Sun, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt?: { seconds: number };
}

interface Post {
  title?: string;
  description?: string;
  view_count?: number;
}

export default function ReaderPage() {
  const params = useParams();
  const id = params?.id ? String(params.id) : null;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = Next, -1 = Back
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Split description into pages while preserving paragraph breaks
  const buildPages = (description: string, wordsPerPage = 160) => {
    const paragraphs = description.split(/\n+/).filter((p) => p.trim().length > 0);
    const result: string[] = [];
    let currentWords: string[] = [];
    let currentCount = 0;

    for (const para of paragraphs) {
      const paraWords = para.split(/\s+/).filter(Boolean);
      let i = 0;
      while (i < paraWords.length) {
        const remaining = wordsPerPage - currentCount;
        const chunk = paraWords.slice(i, i + remaining);
        currentWords.push(chunk.join(" "));
        currentCount += chunk.length;
        i += chunk.length;

        if (currentCount >= wordsPerPage) {
          result.push(currentWords.join("\n"));
          currentWords = [];
          currentCount = 0;
        }
      }
      // paragraph finished but page not full — keep paragraph break for next para
      if (currentWords.length > 0) currentWords.push("");
    }
    if (currentWords.length > 0) result.push(currentWords.join("\n"));
    return result.length > 0 ? result : [""];
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => setCurrentUser(user));

    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "posts", id);
        await updateDoc(docRef, { view_count: increment(1) }).catch(() =>
          setDoc(docRef, { view_count: 1 }, { merge: true })
        );

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Post;
          setPost(data);
          setPages(buildPages(data.description || ""));
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    return () => unsubAuth();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const qLikes = query(collection(db, "likes"), where("postId", "==", id));
    const unsubLikes = onSnapshot(qLikes, (snap) => {
      setLikesCount(snap.size);
      if (currentUser) {
        setIsLiked(snap.docs.some((d) => d.id === `${currentUser.uid}_${id}`));
      }
    });

    const qComments = query(collection(db, "comments"), where("postId", "==", id));
    const unsubComments = onSnapshot(qComments, (snap) => {
      const fetched: Comment[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Comment, "id">) }));
      fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setComments(fetched);
    });

    return () => { unsubLikes(); unsubComments(); };
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return alert("Login zaruri hai!");
    const likeId = `${currentUser.uid}_${id}`;
    const likeRef = doc(db, "likes", likeId);
    try {
      if (isLiked) await deleteDoc(likeRef);
      else await setDoc(likeRef, { userId: currentUser.uid, postId: id });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || isSubmitting) return;

    const tempText = newComment.trim();
    setNewComment("");
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "comments"), {
        postId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Yatri",
        text: tempText,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Comment error: ", err);
      setNewComment(tempText); // restore text so user doesn't lose it
    } finally {
      setIsSubmitting(false);
    }
  };

  const paginate = (newDir: number) => {
    const nextPage = currentPage + newDir;
    if (nextPage >= 0 && nextPage < pages.length) {
      setDirection(newDir);
      setCurrentPage(nextPage);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFAFA] text-gray-400 font-serif italic tracking-widest">
        LOADING...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAFAFA] gap-4">
        <p className="text-gray-500 font-serif italic">Yeh post nahi mili.</p>
        <button onClick={() => router.back()} className="text-blue-600 text-xs font-bold tracking-widest uppercase">Wapas jaayein</button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[70] flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#121212]' : 'bg-[#F4F4F4]'}`}>

      {/* Top Header */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[80]">
        <button onClick={() => router.back()} className={`text-[10px] font-bold tracking-[0.3em] uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exit</button>

        <div className="flex gap-5 items-center">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1">
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-400" />}
          </button>

          <div className="flex items-center gap-1">
            <Eye size={18} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">{post?.view_count || 0}</span>
          </div>

          <button onClick={handleLike} className="flex items-center gap-1">
            <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"} />
            <span className="text-[10px] font-bold text-gray-400">{likesCount}</span>
          </button>

          <button onClick={() => setShowComments(true)} className="flex items-center gap-1">
            <MessageSquare size={18} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400">{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Reader Page Container */}
      <div className="relative z-10 w-[92%] h-[82vh] flex flex-col items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`w-full h-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm flex flex-col p-6 relative border transition-colors duration-500 ${isDarkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-black/5'}`}
          >
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-2 pt-4">
              {currentPage === 0 && (
                <div className="mb-8 text-center">
                  <h1 className={`text-2xl font-serif font-black leading-tight mb-4 uppercase ${isDarkMode ? 'text-gray-100' : 'text-black'}`}>{post?.title}</h1>
                  <div className="w-12 h-[2px] bg-blue-600 mx-auto"></div>
                </div>
              )}
              <div className={`font-serif text-[17px] leading-[1.9] text-justify transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-900'
              }`}>
                {pages[currentPage]?.split("\n").map((para, i) => (
                  para.trim() ? <p key={i} className="mb-5">{para}</p> : null
                ))}
              </div>
            </div>

            <div className={`mt-4 pt-4 border-t flex justify-between items-center px-2 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <span className="text-[9px] font-serif italic text-gray-400 uppercase tracking-widest">Page {currentPage + 1} / {pages.length}</span>
              <div className="flex gap-6">
                <button onClick={() => paginate(-1)} disabled={currentPage === 0} className={`text-[10px] font-bold tracking-widest ${currentPage === 0 ? 'text-gray-300' : 'text-blue-600'}`}>BACK</button>
                <button onClick={() => paginate(1)} disabled={currentPage === pages.length - 1} className={`text-[10px] font-bold tracking-widest ${currentPage === pages.length - 1 ? 'text-gray-300' : 'text-blue-600'}`}>NEXT</button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe/Touch Zones — kept below the card (z-10) so they don't block content/buttons */}
      <div className="absolute inset-y-0 left-0 w-1/5 z-0" onClick={() => paginate(-1)}></div>
      <div className="absolute inset-y-0 right-0 w-1/5 z-0" onClick={() => paginate(1)}></div>

      {/* Comments Sidebar */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[360px] bg-white z-[100] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center text-black">
              <h3 className="font-black text-xs uppercase tracking-[0.2em]">COMMENTS</h3>
              <button onClick={() => setShowComments(false)}><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {comments.length === 0 && (
                <p className="text-xs text-gray-400 font-serif italic text-center mt-10">Abhi tak koi comment nahi.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="space-y-1 border-l-2 border-blue-50 pl-4 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-black font-bold text-[8px] uppercase">{c.userName?.charAt(0)}</div>
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter">{c.userName}</span>
                  </div>
                  <p className="text-sm font-serif text-gray-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="p-6 border-t bg-gray-50 flex gap-2 items-center">
              <input
                value={newComment} onChange={(e) => setNewComment(e.target.value)}
                placeholder="Likhein..."
                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none text-black"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-xl min-w-[48px] flex items-center justify-center disabled:bg-blue-300"
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
