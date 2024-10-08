"use client";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { HomeIcon, PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ScrollArea } from "../../components/ui/scroll-area";

import { Input } from "~/components/ui/input";
import { use, useState } from "react";
import { days, subjects, times } from "../constants";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function LoadingSpinnerSVG() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        className="spinner_ajPY"
      />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const utils = api.useUtils();
  const { user } = useUser();
  const [number, setNumber] = useState("");

  const [subjectGive, setSubjectGive] = useState("");
  const [dayGive, setDayGive] = useState("");
  const [timeGive, setTimeGive] = useState("");

  const [subjectWant, setSubjectWant] = useState("");
  const [dayWant, setDayWant] = useState("");
  const [timeWant, setTimeWant] = useState("");

  const createOffer = api.offer.create.useMutation({
    onSuccess: async () => {
      await utils.offer.invalidate();
      toast.dismiss("begin-processing");
      toast(
        <div className="flex items-center gap-2">
          Uspješno dodana razmjena termina
        </div>,
      );
      router.refresh();
    },
    onError: async () => {
      await utils.offer.invalidate();
      toast.dismiss("begin-processing");
      toast(
        <div className="flex items-center gap-2 font-bold text-red-500">
          Desila se greška na serveru. Ako se problem često pojavljuje,
          prijavite ga Bakiru.
        </div>,
      );
    },
  });

  const submit = () => {
    console.log(number);
    console.log(subjectGive + " " + dayGive + " " + timeGive);
    console.log(subjectWant + " " + dayWant + " " + timeWant);
    toast(
      <div className="flex items-center gap-2">
        <LoadingSpinnerSVG></LoadingSpinnerSVG>Procesira se Vaš zahtjev...
      </div>,
      {
        duration: 999999,
        id: "begin-processing",
      },
    );
    createOffer.mutate({
      phoneNumber: number,
      creatorId: user?.id ?? "", // Replace with actual creator ID, if necessary
      creatorName: user?.firstName ?? "nepoznat", // Replace with actual creator name, if necessary
      subjectGive: subjectGive,
      timeGive: timeGive,
      dayGive: dayGive,
      subjectWant: subjectWant,
      timeWant: timeWant,
      dayWant: dayWant,
    });
  };

  //   const valid = () => {
  //     return (
  //       number.length > 0 &&
  //       subjectGive.length > 0 &&
  //       subjectWant.length > 0 &&
  //       dayGive.length > 0 &&
  //       dayWant.length > 0 &&
  //       timeGive.length > 0 &&
  //       timeWant.length > 0
  //     );
  //   };

  return (
    <nav className="flex h-12 w-full items-center gap-4 bg-primary-foreground px-4 py-2 font-mono">
      <h2 className="font-black md:text-xl">Grupomjenjac v0.1</h2>
      <div className="ml-auto flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <Button className="bg-blue-700 font-bold hover:bg-blue-700/80">
              Prijavi se
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Dialog>
            <DialogTrigger asChild>
              <PlusIcon className="h-6 w-6 cursor-pointer rounded bg-secondary p-0.5 text-white hover:bg-secondary/80"></PlusIcon>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Dodaj razmjenu grupa
                </DialogTitle>
                <div className="text-sm text-gray-300">
                  <h2 className="text-lg text-white">Nudim termin:</h2>
                  <div className="flex gap-2">
                    <div className="my-1 flex items-center gap-2">
                      <p>Predmet:</p>
                      <Select onValueChange={(v) => setSubjectGive(v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Predmet" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((item, i) => (
                            <SelectItem key={i} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <p>Dan:</p>
                      <Select onValueChange={(v) => setDayGive(v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Dan" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((item, i) => (
                            <SelectItem key={i} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>Termin:</p>
                    <Select onValueChange={(v) => setTimeGive(v)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Termin" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[220px]">
                          {times.map((item, i) => (
                            <SelectItem key={i} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  <h2 className="text-lg text-white">Želim termin:</h2>
                  <div className="flex gap-2">
                    <div className="my-1 flex items-center gap-2">
                      <p>Predmet:</p>
                      <Select onValueChange={(v) => setSubjectWant(v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Predmet" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((item, i) => (
                            <SelectItem key={i} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <p>Dan:</p>
                      <Select onValueChange={(v) => setDayWant(v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Dan" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((item, i) => (
                            <SelectItem key={i} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p>Termin:</p>
                    <Select onValueChange={(v) => setTimeWant(v)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Termin" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[220px]">
                          {times.map((item, i) => (
                            <SelectItem key={i} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-4">Kontakt telefon (za viber):</p>
                  <Input
                    onChange={(e) => setNumber(e.currentTarget.value)}
                    placeholder="Vaše cifre, madame?..."
                  ></Input>
                  <div className="mt-4 flex gap-2">
                    <DialogClose asChild>
                      <Button variant={"outline"} className="ml-auto">
                        Zatvori
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={submit}
                        className="bg-blue-700 text-white hover:bg-blue-700/80"
                        disabled={
                          !(
                            number.length > 0 &&
                            subjectGive.length > 0 &&
                            subjectWant.length > 0 &&
                            dayGive.length > 0 &&
                            dayWant.length > 0 &&
                            timeGive.length > 0 &&
                            timeWant.length > 0
                          )
                        }
                      >
                        Potvrdi
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {/* <Link href={"/moje-ponude"}>
            <HomeIcon className="h-6 w-6 cursor-pointer rounded bg-secondary p-1 text-white hover:bg-secondary/80"></HomeIcon>
          </Link> */}
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
