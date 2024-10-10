import { CreateOfferButton } from "./CreateOfferButton";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { CommitIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="relative z-10 flex h-12 w-full items-center gap-4 bg-primary-foreground px-4 py-2 font-mono">
      <Link href="/" className="font-black md:text-xl">
        Grupomjenjac v0.2
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <Link href={"/ispomoc"}>
          <QuestionMarkCircledIcon className="h-6 w-6 cursor-pointer rounded bg-secondary p-0.5 text-white hover:bg-secondary/80"></QuestionMarkCircledIcon>
        </Link>
        <Link href={"/graf"}>
          <CommitIcon className="h-6 w-6 cursor-pointer rounded bg-secondary p-0.5 text-white hover:bg-secondary/80"></CommitIcon>
        </Link>
        <SignedOut>
          <SignInButton>
            <Button className="bg-blue-700 font-bold text-white hover:bg-blue-700/80">
              Prijavi se
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <CreateOfferButton />
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
