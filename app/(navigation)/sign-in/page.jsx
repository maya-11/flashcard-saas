import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center flex-col gap-6">
      <h1 className="text-4xl font-bold text-slate-200">Sign In</h1>
      <SignIn redirectUrl={"/"} />
    </div>
  );
}
