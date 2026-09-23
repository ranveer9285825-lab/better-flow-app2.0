"use client";
import React, { useState } from 'react';
import { auth } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account Created Successfully!");
      router.push("/profile"); 
    } catch (error: any) {
      setMessage("Error: " + error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Logged In!");
      router.push("/profile"); 
    } catch (error: any) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Better Flow Login</h1>
      
      <div className="w-full max-w-sm space-y-4">
        <input 
          type="email" 
          placeholder="Enter Email" 
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          type="password" 
          placeholder="Enter Password" 
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-4">
          <button onClick={handleSignIn} className="flex-1 bg-blue-600 p-3 rounded font-bold">
            Login
          </button>
          <button onClick={handleSignUp} className="flex-1 bg-green-600 p-3 rounded font-bold">
            Sign Up
          </button>
        </div>

        {message && <p className="text-center text-sm text-yellow-500 mt-4">{message}</p>}
      </div>
    </div>
  );
}
