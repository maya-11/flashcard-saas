"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [setName, setSetName] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    async function getFlashcardSet() {
      if (!isLoaded || !isSignedIn || !user || !params.id) return;

      try {
        const decodedId = decodeURIComponent(params.id);
        const userDocRef = doc(collection(db, "users"), user.id);
        const setDocRef = doc(
          collection(userDocRef, "flashcardSets"),
          decodedId
        );
        const setDocSnap = await getDoc(setDocRef);

        if (setDocSnap.exists()) {
          const setData = setDocSnap.data();
          if (Array.isArray(setData.flashcards)) {
            setFlashcards(setData.flashcards);
            setSetName(decodedId);
          } else {
            setError("Flashcards not found in the expected format");
          }
        } else {
          setError("Flashcard set not found");
        }
      } catch (error) {
        console.error("Error fetching flashcard set:", error);
        setError("An error occurred while fetching the flashcard set");
      }
    }

    getFlashcardSet();
  }, [isLoaded, isSignedIn, user, params.id]);

  const handleCardClick = (index) => {
    setFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!isLoaded) {
    return <div className="loading text-4xl py-20">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4">
        <div className="mt-8 mb-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6">Flashcards</h1>
          <div className="w-full bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <p className="text-red-500">
              You must sign in first to view flashcards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="mt-8 mb-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6">Error</h1>
          <div className="w-full bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push("/flashcards")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Back to Flashcard Sets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 ">
      <h1 className="text-6xl font-bold text-[#F2EBFF] text-center mb-8 capitalize">
        {setName}
      </h1>
      <div className="w-5/6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mx-auto mb-10">
        {flashcards.map((flashcard, index) => (
          <div key={index} className="perspective-1000">
            <div
              className={`relative w-full h-48 transition-transform duration-600 transform-style-preserve-3d cursor-pointer ${
                flipped[index] ? "rotate-y-180" : ""
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="absolute w-full h-full backface-hidden text-center flex justify-center items-center p-4 bg-white shadow-lg rounded-lg font-bold">
                <p className="text-2xl">{flashcard.front}</p>
              </div>
              <div className="absolute w-full h-full backface-hidden flex text-center justify-center items-center p-4 bg-white shadow-lg rounded-lg rotate-y-180 overflow-auto font-bold">
                <p className="text-2xl">{flashcard.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
