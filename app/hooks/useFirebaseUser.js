"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust this path as needed

export function useFirebaseUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const userDoc = doc(db, "users", user.id);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            setFirebaseUser(userSnapshot.data());
          } else {
            // If the user does not exist in Firestore, create a new user
            const newUser = {
              uid: user.id,
              email: user.email,
              planType: "free",
              // Add any additional fields needed
            };
            await setDoc(userDoc, newUser);
            setFirebaseUser(newUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setFirebaseUser(null);
        }
      } else {
        setFirebaseUser(null);
      }
      setIsFirebaseLoading(false);
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user]);

  return { firebaseUser, isFirebaseLoading };
}
