"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../firebase";
import { useRouter } from "next/navigation";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashCards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [text, setText] = useState("");
  const [setName, setSetName] = useState("");
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFlashcardSets, setSavedFlashcardSets] = useState(0);
  const { firebaseUser, isFirebaseLoading } = useFirebaseUser();
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      if (isLoaded && user && firebaseUser) {
        const userRef = doc(db, "users", user.id);
        const flashcardSetsRef = collection(userRef, "flashcardSets");
        const flashcardSetsSnap = await getDocs(flashcardSetsRef);
        setSavedFlashcardSets(flashcardSetsSnap.size);
      }
    }
    fetchUserData();
  }, [isLoaded, user, firebaseUser]);

  const getPlanLimit = (planType) => {
    switch (planType) {
      case "free":
        return 10;
      case "basic":
        return 50;
      case "pro":
        return Infinity;
      default:
        return 0;
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter some text to generate flashcards.");
      return;
    }

    const planLimit = getPlanLimit(firebaseUser.planType);
    if (savedFlashcardSets >= planLimit) {
      alert(`You've reached the limit for the ${firebaseUser.planType} plan. Please upgrade to generate more flashcards.`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: text,
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      setFlashCards(data);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("An error occurred while generating flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const saveFlashcards = async () => {
    if (!setName.trim()) {
      alert("Please enter a name for your flashcard set.");
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(collection(db, "users"), user.id);
      const setDocRef = doc(collection(userDocRef, "flashcardSets"), setName);
      
      await setDoc(setDocRef, { flashcards });

      // Update local state
      setSavedFlashcardSets((prev) => prev + 1);

      alert("Flashcards saved successfully!");
      handleClose();
      setSetName("");
      setFlashCards([]);
      setText("");
    } catch (error) {
      console.error("Error saving flashcards:", error);
      alert("An error occurred while saving flashcards. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isFirebaseLoading) {
    return <div className="loading text-4xl py-20">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4">
        <div className="mt-8 mb-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-slate-200 mb-6">
            Generate Flashcards
          </h1>
          <div className="w-full bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <p className="text-red-500">
              You must sign in first to make flashcards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const planLimit = getPlanLimit(firebaseUser.planType);

  return (
    <div className="container mx-auto px-4">
      <div className="mt-8 mb-12 flex flex-col items-center">
        <div className="w-3/4 bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4">Generate Flashcards</h1>
          <p className="mb-4">
            Enter your notes or prompt below to create a set of 10 flashcards.
          </p>
          <p className="mb-4 capitalize">
            Your current plan: {firebaseUser.planType || "None"}
          </p>
          <p className="mb-4">Flashcard Sets Saved: {savedFlashcardSets} / {planLimit === Infinity ? "Unlimited" : planLimit}</p>
          {!firebaseUser.planType && (
            <p className="text-red-500 mb-4">
              You must select a plan to continue.
            </p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter Text Here"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            rows={4}
            disabled={!firebaseUser.planType || savedFlashcardSets >= planLimit}
          />
          <button
            onClick={handleSubmit}
            className="submitBtn"
            disabled={
              !firebaseUser.planType ||
              isGenerating ||
              savedFlashcardSets >= planLimit
            }
          >
            {isGenerating ? "Generating..." : "Submit"}
          </button>
        </div>
      </div>

      {flashcards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-[#F2EBFF] text-center mb-4">
            Flashcards Preview
          </h2>
          <div className="w-5/6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mx-auto">
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
          <div className="mt-8 mb-8 flex justify-center">
            <button onClick={handleOpen} className="saveBtn">
              Save
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg min-w-96">
            <h2 className="text-2xl font-bold text-center mb-4">
              Save Flashcards
            </h2>
            <p className="mb-4 text-center">Name your flashcard collection</p>
            <input
              type="text"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Collection Name"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={saveFlashcards}
                className="saveBtn"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleClose}
                className="closeBtn"
                disabled={isSaving}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
