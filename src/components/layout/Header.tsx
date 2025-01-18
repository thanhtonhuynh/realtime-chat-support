import Link from "next/link";
import { Button } from "../ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 flex-col items-center justify-center bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative flex h-full w-full max-w-screen-2xl items-center justify-between px-4 lg:px-12">
        <Link href="/" className="flex items-center text-lg font-black">
          ton huynh
        </Link>

        <Button>Login</Button>
      </div>
    </header>
  );
}
