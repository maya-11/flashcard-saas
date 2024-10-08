import {
  doc,
  collection,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const deleteSet = async (userId, setId) => {
  if (!userId) throw new Error("No user ID provided");
  if (!setId) throw new Error("No set ID provided");

  const batch = writeBatch(db);

  // Reference to the flashcard set document
  const setRef = doc(db, "users", userId, "flashcardSets", setId);

  // Delete all flashcards in the set
  const flashcardsRef = collection(setRef, "flashcards");
  const flashcardsSnapshot = await getDocs(flashcardsRef);
  flashcardsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete the flashcard set document
  batch.delete(setRef);

  // Update the user's flashcardSets array
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    const updatedSets = (userData.flashcardSets || []).filter(
      (set) => set.name !== setId
    );
    batch.update(userRef, { flashcardSets: updatedSets });
  }

  // Commit the batch
  await batch.commit();
};
