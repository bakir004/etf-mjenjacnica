import { CreateOfferButton } from "./CreateOfferButton";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import {
  CommitIcon,
  HamburgerMenuIcon,
  QuestionMarkCircledIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

export default function Navbar() {
  return (
    <nav className="relative z-10 flex h-12 w-full items-center gap-4 bg-primary-foreground px-4 py-2 font-mono">
      <Link href="/" className="font-black md:text-xl">
        Zmanger v0.4.1
      </Link>
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        <Link
          href={"/about"}
          className="flex items-center gap-2 rounded bg-secondary px-2 py-1 text-sm transition hover:scale-110 hover:bg-secondary/80"
        >
          About
          <QuestionMarkCircledIcon className="h-4 w-4"></QuestionMarkCircledIcon>
        </Link>
        <Link
          href={"/graf"}
          className="flex items-center gap-2 rounded bg-secondary px-2 py-1 text-sm transition hover:scale-110 hover:bg-secondary/80"
        >
          Graf
          <CommitIcon className="h-4 w-4"></CommitIcon>
        </Link>
        <SignedIn>
          <Link
            prefetch={true}
            href={"/testovi"}
            className="flex items-center gap-2 rounded bg-secondary px-2 py-1 text-sm transition hover:scale-110 hover:bg-secondary/80"
          >
            Testovi
            <ReaderIcon className="h-4 w-4"></ReaderIcon>
          </Link>
        </SignedIn>
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
      <div className="ml-auto flex items-center justify-end gap-4 sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <HamburgerMenuIcon className="h-6 w-6 cursor-pointer rounded bg-secondary p-0.5 text-white hover:bg-secondary/80"></HamburgerMenuIcon>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Navigacija</SheetTitle>
              <SheetDescription>
                Sve opcije i rute se nalaze ovdje
              </SheetDescription>
            </SheetHeader>
            <div className="mt-2 flex flex-col gap-2">
              <SheetClose asChild>
                <Link
                  className="flex items-center gap-2 rounded bg-neutral-900 px-2 py-1 text-sm"
                  href={"/about"}
                >
                  <QuestionMarkCircledIcon className="h-4 w-4"></QuestionMarkCircledIcon>
                  About
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  className="flex items-center gap-2 rounded bg-neutral-900 px-2 py-1 text-sm"
                  href={"/graf"}
                >
                  <CommitIcon className="h-4 w-4"></CommitIcon>
                  Grafik razmjena
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  className="flex items-center gap-2 rounded bg-neutral-900 px-2 py-1 text-sm"
                  href={"/testovi"}
                >
                  <ReaderIcon className="h-4 w-4"></ReaderIcon>
                  Zamger testovi
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
