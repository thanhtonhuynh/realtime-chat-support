import { logoutAction } from "@/app/(auth)/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export async function Header() {
  const { user } = await getCurrentSession();

  return (
    <header className="sticky top-0 z-50 flex h-16 flex-col items-center justify-center bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative flex h-full w-full max-w-screen-2xl items-center justify-between px-4 lg:px-12">
        <Link href="/" className="flex items-center text-lg font-black">
          ton huynh
        </Link>

        {user ? (
          <div className="flex items-center space-x-4">
            <div>
              Welcome, <span className="font-bold">{user.name}</span>
            </div>

            <form action={logoutAction}>
              <Button variant={`outline`}>
                <LogOut className="size-4" /> Sign Out
              </Button>
            </form>
          </div>
        ) : (
          <Button asChild>
            <Link href={`/login`}>Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
