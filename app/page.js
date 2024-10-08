"use client";
import Footer from "./components/Footer.jsx";
import Link from "next/link";
import Image from "next/image";

// PricingSection as a separate client component
import dynamic from "next/dynamic";
const PricingSection = dynamic(
  () => import("./components/PricingSection.jsx"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <section className="flex flex-col md:flex-row justify-center items-center gap-4 mx-auto text-center mx-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">
            Seamless Flashcard Creation with Flash Wave
          </h1>
          <p className="text-xl text-slate-200 mb-8">
            Elevate your learning experience with our AI-driven flashcard tool,
            designed to effortlessly generate content and tailor your study
            approach to fit your unique needs.
          </p>
          <Link href="/generate" className="startBtn w-fit">
            Begin Your Journey
          </Link>
        </div>
        <div>
          <Image
            src="/example.png"
            width={1000}
            height={1000}
            alt="Flashcard set preview"
          />
        </div>
      </section>
      <section className="grid grid-cols-1 my-20 justify-items-center text-black bg-[#E6E6FA] py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-5/6">
          <div>
            <h3 className="text-xl font-bold mb-4">Effortless Usability</h3>
            <p className="w-11/12">
              Crafted for simplicity, our platform offers a user-centric
              interface that ensures smooth navigation throughout the flashcard
              creation process. Whether you're a student, educator, or lifelong
              learner, you'll appreciate the streamlined and intuitive design
              that enhances productivity.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              AI-Powered Flashcard Generation
            </h3>
            <p className="w-11/12">
              Experience the power of AI as it efficiently creates tailored
              flashcards based on your input. Our intelligent system quickly
              compiles relevant information, delivering comprehensive flashcard
              sets that save you time and ensure precision, making it ideal for
              mastering any subject.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Secure Flashcard Storage</h3>
            <p className="w-11/12">
              Keep your essential study materials safe and easily accessible.
              Our platform enables you to store flashcards securely, allowing
              for seamless revisits and uninterrupted learning, anytime and
              anywhere.
            </p>
          </div>
        </div>
      </section>
      <PricingSection />
      <Footer />
    </>
  );
}
