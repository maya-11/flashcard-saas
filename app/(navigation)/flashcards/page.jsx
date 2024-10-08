"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { doc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteSet } from "../../firebaseServices";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcardSets() {
      if (!user) return;
      const userDocRef = doc(collection(db, "users"), user.id);
      const flashcardSetsCollectionRef = collection(
        userDocRef,
        "flashcardSets"
      );
      const flashcardSetsSnapshot = await getDocs(flashcardSetsCollectionRef);
      const sets = flashcardSetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlashcardSets(sets);
    }
    getFlashcardSets();
  }, [user]);

  const handleDelete = async (setId, e) => {
    e.preventDefault(); // Prevent the Link from being activated
    e.stopPropagation(); // Stop the event from bubbling up
    if (window.confirm("Are you sure you want to delete this set?")) {
      setIsDeleting(true);
      try {
        await deleteSet(user.id, setId);
        setFlashcardSets(flashcardSets.filter(set => set.id !== setId));
      } catch (error) {
        console.error("Error deleting set:", error);
        alert("An error occurred while deleting the set. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isLoaded)
    return <div className="loading text-4xl py-20">Loading...</div>;

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="mt-8 mb-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6">Flashcard Sets</h1>
          <div className="w-full bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <p className="text-red-500">
              You must sign in first to view flashcard sets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <h1 className="text-4xl font-bold text-slate-200 text-center mb-4">
        Saved Flashcard Sets
      </h1>
      {flashcardSets.length === 0 ? (
        <div className="text-center text-gray-500">
          No flashcard sets available. Please generate and save a set.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {flashcardSets.map((set, index) => (
            <div key={index} className="relative">
              <Link href={`/flashcard/${set.id}`}>
                <div className="flex cursor-pointer rounded-lg border items-center justify-center text-center border-gray-200 shadow-md transition-shadow hover:shadow-lg min-h-32 p-4 bg-white">
                  <h2 className="text-2xl font-semibold text-black capitalize text-center">
                    {set.name || set.id}
                  </h2>
                </div>
              </Link>
              <button
                onClick={(e) => handleDelete(set.id, e)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                disabled={isDeleting}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}