"use client";
import { useState, useEffect } from "react";
import { useFirebaseUser } from "../hooks/useFirebaseUser"; // Adjust this path as needed
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust this path as needed

const plans = [
  {
    type: "free",
    name: "Free",
    displayName: <span className="font-bold text-xl">Free</span>,
    price: "$0/Month",
    limit: "10 Flashcard Sets",
  },
  {
    type: "basic",
    name: "Basic",
    displayName: <span className="font-bold text-xl">Basic</span>,
    price: "$5/Month",
    limit: "50 Flashcard Sets",
  },
  {
    type: "pro",
    name: "Pro",
    displayName: <span className="font-bold text-xl">Pro</span>,
    price: "$10/Month",
    limit: "Unlimited Flashcard Sets",
  },
];

export default function PricingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const { firebaseUser, isFirebaseLoading } = useFirebaseUser();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [message, setMessage] = useState("");
  const isLoggedIn = firebaseUser !== null;

  useEffect(() => {
    if (firebaseUser) {
      setCurrentPlan(firebaseUser.planType);
    }
  }, [firebaseUser]);

  const handleSubmit = async (planType) => {
    if (!isLoggedIn) {
      setMessage("Sign Up to select a plan.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      if (planType === currentPlan) {
        setMessage("You are already subscribed to this plan.");
        return;
      }

      if (planType === "free") {
        await handleDowngrade(planType);
      } else {
        const response = await fetch("/api/checkout_sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planType }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async (planType) => {
    if (!firebaseUser) return;

    try {
      // Cancel the current subscription in Stripe
      const response = await fetch("/api/cancel_subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: firebaseUser.uid }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the user's plan in Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        planType: planType,
        subscriptionId: null,
        planExpirationDate: null,
      });

      setCurrentPlan(planType);
      setMessage(
        "Your plan has been downgraded to Free. Your current subscription will remain active until the end of the billing period."
      );
    } catch (error) {
      console.error("Error downgrading plan:", error);
      setMessage("There was an error downgrading your plan. Please try again.");
    }
  };

  if (isFirebaseLoading) {
    return <div className="loading text-4xl py-20">Loading...</div>;
  }

  return (
    <section className="grid grid-cols-1 gap-4 my-4 justify-items-center">
      <h2 className="text-3xl font-bold text-slate-200 mb-4">Pricing</h2>
      {message && <div className="mb-4 text-red-500">{message}</div>}
      {!currentPlan && isLoggedIn && (
        <div className="mt-4 text-red-500">Select a Plan</div>
      )}
      <div className="text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
        {plans.map((plan) => (
          <div
            className="flex flex-col p-4 bg-slate-100 rounded-lg text-[#180082] items-center min-w-64"
            key={plan.type}
          >
            <h1>{plan.displayName}</h1>
            <p>{plan.price}</p>
            <p>{plan.limit}</p>
            <button
              onClick={() => handleSubmit(plan.type)}
              className={`${
                plan.type === "free"
                  ? "freeBtn mt-4 mb-4"
                  : plan.type === "basic"
                  ? "basicBtn mt-4 mb-4"
                  : "proBtn mt-4 mb-4"
              }`}
              disabled={isLoading || currentPlan === plan.type}
            >
              {isLoading
                ? "Processing..."
                : !isLoggedIn || !currentPlan
                ? `Choose ${plan.name} Plan`
                : currentPlan === plan.type
                ? "Current Plan"
                : `Choose ${plan.name} Plan`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
