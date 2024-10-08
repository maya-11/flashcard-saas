"use client";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Make sure this path is correct
import { useFirebaseUser } from "../hooks/useFirebaseUser";
import Image from "next/image";

export default function Navbar() {
  const { isLoaded, user } = useUser();
  const [planType, setPlanType] = useState(null);
  const { firebaseUser, isFirebaseLoading } = useFirebaseUser();

  useEffect(() => {
    async function fetchUserPlan() {
      if (isLoaded && user) {
        try {
          const userRef = doc(db, "users", user.id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setPlanType(userSnap.data().planType);
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
        }
      }
    }
    fetchUserPlan();
  }, [isLoaded, user]);

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between py-4 px-6 mb-10">
      <div className="mb-4 sm:mb-0">
        <Link
          href="/"
          className="flex text-2xl tracking-wider hover:transform hover:scale-110 gap-2 items-center"
        >
          <Image src="/logo.png" width={35} height={35} alt="Flash Wave Logo" />
          <span className="typing-text">
            {Array.from("Flash\u00A0Wave").map((char, index) => (
              <span key={index} className="typing-letter">
                {char}
              </span>
            ))}
          </span>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 ">
        <SignedIn>
          <Link href={`/generate`} className="navBtn">
            Generate Flashcards
          </Link>
          <Link href={`/flashcards`} className="navBtn">
            Saved Flashcards
          </Link>
          {!isFirebaseLoading && firebaseUser && (
            <span className="text-md font-medium text-slate-300 capitalize text-[#F39C6B]">
              {firebaseUser.planType ? firebaseUser.planType : "None"}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="navBtn">
            Sign In
          </Link>
          <Link href="/sign-up" className="navBtn">
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
}
