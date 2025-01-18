import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { SignUpForm } from "./SignUpForm";
import { MonitorSpeaker } from "lucide-react";

export default async function Page() {
  const { session } = await getCurrentSession();
  if (session) redirect("/");

  return (
    <section className="absolute left-1/2 top-1/2 w-screen -translate-x-1/2 -translate-y-1/2 p-2 md:w-2/3 md:p-0 lg:w-1/2">
      <div className="mb-8 flex items-center justify-center space-x-1 font-bold">
        <MonitorSpeaker size={30} />
        <span className="select-none text-4xl tracking-wider">techbuy</span>
      </div>

      <div className="flex flex-col space-y-4 rounded-md border p-8 shadow-md">
        <h1>Sign Up</h1>

        <SignUpForm />

        <Link href={`/login`} className="text-center hover:underline">
          Already have an account? <span className="text-blue-500">Log in</span>
        </Link>
      </div>
    </section>
  );
}
