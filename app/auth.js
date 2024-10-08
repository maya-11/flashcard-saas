import { getToken } from "@clerk/nextjs/server";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function signInWithClerk(clerkUser) {
  if (!clerkUser) return;

  const auth = getAuth();
  const token = await getToken({ template: "firebase" });

  try {
    await signInWithCustomToken(auth, token);
    console.log("Successfully signed in with Clerk token");

    // Create or update user in Firestore
    const userRef = doc(db, "users", clerkUser.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New user, create document
      await setDoc(userRef, {
        uid: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        planType: "free",
        flashcardSetsGenerated: 0,
        stripeCustomerId: null,
        subscriptionId: null,
        planExpirationDate: null,
      });
    } else {
      // Existing user, update last login
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    }
  } catch (error) {
    console.error("Error signing in with Clerk token:", error);
  }
}
