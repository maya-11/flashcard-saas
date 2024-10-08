// app/api/checkout_sessions/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req) {
  try {
    const { planType } = await req.json();

    let priceData;
    if (planType === "free") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Free Subscription",
        },
        unit_amount: 0,
        recurring: {
          interval: "month",
        },
      };
    } else if (planType === "basic") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Basic Subscription",
        },
        unit_amount: 500, // $5.00
        recurring: {
          interval: "month",
        },
      };
    } else if (planType === "pro") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Pro Subscription",
        },
        unit_amount: 1000, // $10.00
        recurring: {
          interval: "month",
        },
      };
    } else {
      throw new Error("Invalid plan type");
    }

    const params = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get(
        "origin"
      )}/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}`,
    };

    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  try {
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
