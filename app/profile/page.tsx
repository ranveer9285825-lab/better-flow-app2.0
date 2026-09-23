"use client";
import React, { useEffect, useState } from 'react';
import { auth, db } from "@/lib/firebase";
import { 
  doc, getDoc, setDoc, collection, query, 
  where, onSnapshot, deleteDoc, orderBy 
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  Settings, User, ArrowRightLeft, LogOut, Check, X, 
  ShieldCheck, Trash2, Edit3, MessageSquare
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setEditName(data.fullName || "");
          setEditUsername(data.username || "");
          setEditBio(data.bio || "");
        }

        const qPosts = query(collection(db, "posts"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
        const unsubPosts = onSnapshot(qPosts, (snap) => {
          setUserPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }, (err) => {
          const simpleQ = query(collection(db, "posts"), where("userId", "==", currentUser.uid));
          onSnapshot(simpleQ, (s) => {
            setUserPosts(s.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
          });
        });

        const qFans = query(collection(db, "follows"), where("followedId", "==", currentUser.uid));
        const unsubFans = onSnapshot(qFans, (snap) => setFollowersCount(snap.size));

        const qFollowing = query(collection(db, "follows"), where("followerId", "==", currentUser.uid));
        const unsubFollowing = onSnapshot(qFollowing, (snap) => setFollowingCount(snap.size));

        return () => {
          unsubPosts();
          unsubFans();
          unsubFollowing();
        };
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); // Yeh line post khulne se rokegi jab aap delete dabayenge
    if (window.confirm("Kya aap is post ko delete karna chahte hain?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        alert("Post delete ho gayi!");
      } catch (err) { alert("Error!"); }
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName: editName,
        username: editUsername,
        bio: editBio,
      }, { merge: true });
      setProfileData({ ...profileData, fullName: editName, username: editUsername, bio: editBio });
      setIsEditing(false);
    } catch (err) { console.error(err); }
  };

  const handleSwitchAccount = async () => {
    if (!user) return;
    const currentType = profileData?.userType || "normal";
    const newType = currentType === "creator" ? "normal" : "creator";
    try {
      await setDoc(doc(db, "users", user.uid), {
        userType: newType,
        supporters: newType === "creator" ? 0 : null
      }, { merge: true });
      setProfileData({ ...profileData, userType: newType });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-20 text-center font-serif italic text-gray-400">Panna palat rahe hain...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F3] pb-24 text-[#333]">
      <header className="px-6 py-5 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-lg lowercase tracking-tighter">
            @{profileData?.username || "user"}
          </h2>
          {profileData?.userType === "creator" && <ShieldCheck size={16} className="text-blue-500" />}
        </div>
        <div className="flex gap-5 items-center">
          <button onClick={() => signOut(auth)} className="text-red-400"><LogOut size={20}/></button>
          <Settings size={20} className="text-gray-300" />
        </div>
      </header>

      {!isEditing ? (
        <main>
          <section className="px-6 pt-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden text-gray-200">
                    <User size={40} />
                  </div>
                </div>
                <div className="flex-1 flex justify-around border-l border-gray-50">
                  <div className="text-center">
                    <p className="font-black text-xl">{userPosts.length}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Chapters</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-xl">{followersCount}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Fans</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-xl">{followingCount}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Following</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="font-black text-xl font-serif">{profileData?.fullName || "Better Flow User"}</h1>
                <p className="text-[13px] text-gray-500 font-serif leading-relaxed mt-2">
                  {profileData?.bio || "Aapke vichaar yahan dikhenge..."}
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-transform">
                  Edit Profile
                </button>
                <button onClick={handleSwitchAccount} className="px-6 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-blue-100">
                  <ArrowRightLeft size={18} />
                  <span className="ml-2 text-[9px] font-black uppercase">
                    {profileData?.userType === "creator" ? "To Reader" : "To Creator"}
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className="px-6 mt-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Mere Chapters</h3>
              <span className="h-[1px] flex-1 bg-gray-100 ml-4"></span>
            </div>

            <div className="space-y-5">
              {userPosts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => router.push(`/read/${post.id}`)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="absolute top-0 right-0 bg-blue-50 text-blue-600 text-[8px] font-bold px-3 py-1 rounded-bl-lg uppercase">{post.category || "General"}</span>
                  <div className="flex justify-between items-start">
                    <div className="border-l-2 border-blue-400 pl-4 flex-1">
                      <h4 className="font-bold text-base font-serif text-gray-900 leading-tight mb-1">{post.title}</h4>
                      <p className="text-[12px] text-gray-500 font-serif line-clamp-2 leading-relaxed">{post.description}</p>
                    </div>
                    <div className="flex flex-col gap-4 ml-4">
                      <button 
                        onClick={(e) => handleDeletePost(e, post.id)} 
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/edit/${post.id}`);
                        }} 
                        className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        /* Edit Profile UI stays the same */
        <div className="px-6 pt-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Edit Profile</h3>
            <div className="flex gap-6">
              <button onClick={() => setIsEditing(false)} className="text-gray-300"><X size={24}/></button>
              <button onClick={handleUpdateProfile} className="text-blue-600"><Check size={24}/></button>
            </div>
          </div>
          <div className="space-y-5">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Naam" className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-sm outline-none font-bold" />
            <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Username" className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-sm outline-none" />
            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={4} placeholder="Bio" className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-sm outline-none resize-none font-serif" />
          </div>
        </div>
      )}
    </div>
  );
}
