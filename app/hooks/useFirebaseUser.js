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
    async function syncUserWithFirebase() {
      if (isLoaded && isSignedIn && user) {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // User doesn't exist in Firebase, create a new document
          const newUser = {
            uid: user.id,
            email: user.primaryEmailAddress.emailAddress,
            planType: "free",
            flashcardSetsGenerated: 0,
            stripeCustomerId: null,
            subscriptionId: null,
            planExpirationDate: null,
          };
          await setDoc(userRef, newUser);
          setFirebaseUser(newUser);
        } else {
          // User exists, update the document with the latest Clerk data
          const existingUser = userSnap.data();
          const updatedUser = {
            ...existingUser,
            email: user.primaryEmailAddress.emailAddress,
          };
          await setDoc(userRef, updatedUser, { merge: true });
          setFirebaseUser(updatedUser);
        }
        setIsFirebaseLoading(false);
      } else if (isLoaded && !isSignedIn) {
        setFirebaseUser(null);
        setIsFirebaseLoading(false);
      }
    }

    syncUserWithFirebase();
  }, [isLoaded, isSignedIn, user]);

  return { firebaseUser, isFirebaseLoading };
}
