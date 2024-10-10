"use client";
import React from "react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { days, subjects, times } from "~/lib/constants";
import { SelectForm } from "./Select";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { Offer } from "@prisma/client";
import LoadingSpinnerSVG from "./Spinner";
import { z } from "zod";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const OfferSchema = z.object({
  phoneNumber: z.string().nonempty("Broj telefona je obavezan"),
  creatorId: z.string().nonempty("ID kreatora je obavezan"),
  creatorName: z.string().nonempty("Ime kreatora je obavezno"),
  subjectGive: z.string().nonempty("Predmet koji se nudi je obavezan"),
  timeGive: z.string().nonempty("Termin koji se nudi je obavezan"),
  dayGive: z.string().nonempty("Dan koji se nudi je obavezan"),
  subjectWant: z.string().nonempty("Predmet koji se želi je obavezan"),
  timeWant: z.string().nonempty("Termin koji se želi je obavezan"),
  dayWant: z.string().nonempty("Dan koji se želi je obavezan"),
  id: z.number().int().nonnegative("ID mora biti nenegativni cijeli broj"),
});

export default function CreateOfferModal() {
  const router = useRouter();
  const utils = api.useUtils();
  const { user } = useUser();
  const createOffer = api.offer.create.useMutation({
    onSuccess: async () => {
      void utils.offer.getAll.invalidate();
      toast.dismiss("begin-processing");
      toast.success("Uspješno dodana razmjena termina");
      router.refresh();
    },
    onError: (error) => {
      toast.dismiss("begin-processing");
      toast.error(`Desila se greška na serveru. ${error.message}`);
    },
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const offer: Offer = {
      phoneNumber: data.phoneNumber as string,
      creatorId: user?.id ?? "",
      creatorName: user?.firstName ?? "Anonimac",
      subjectGive: data.subjectGive as string,
      timeGive: data.timeGive as string,
      dayGive: data.dayGive as string,
      subjectWant: data.subjectWant as string,
      timeWant: data.timeWant as string,
      dayWant: data.dayWant as string,
      id: Number(data.id) || 0,
      createdAt: new Date(data.createdAt as string),
    };
    try {
      OfferSchema.parse(offer);
      toast.loading(
        <div className="flex items-center gap-2 font-bold">
          <LoadingSpinnerSVG></LoadingSpinnerSVG>
          Procesuiramo vaš zahtjev...
        </div>,
        {
          id: "begin-processing",
        },
      );
      createOffer.mutate(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(`Neispravni podaci! ${error.errors[0]?.message}.`);
      }
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-xl">Dodaj razmjenu grupa</DialogTitle>
      </DialogHeader>
      <DialogDescription asChild>
        <form
          onSubmit={submit}
          className="flex w-full flex-col text-sm text-gray-300"
        >
          <h2 className="text-left text-lg text-white">Nudim termin:</h2>
          <div className="flex flex-wrap gap-2">
            <div className="my-1 flex items-center gap-2">
              <p>Predmet:</p>
              <SelectForm
                name={"subjectGive"}
                elements={subjects}
                placeholder="Predmet"
              />
            </div>
            <div className="flex items-center gap-2">
              <p>Dan:</p>
              <SelectForm name={"dayGive"} elements={days} placeholder="Dan" />
            </div>
            <div className="flex items-center gap-2">
              <p>Termin:</p>
              <SelectForm
                name={"timeGive"}
                elements={times}
                placeholder="Termin"
              />
            </div>
          </div>
          <h2 className="text-lg text-white">Želim termin:</h2>
          <div className="flex flex-wrap gap-2">
            <div className="my-1 flex items-center gap-2">
              <p>Predmet:</p>
              <SelectForm
                name={"subjectWant"}
                elements={subjects}
                placeholder="Predmet"
              />
            </div>
            <div className="flex items-center gap-2">
              <p>Dan:</p>
              <SelectForm name={"dayWant"} elements={days} placeholder="Dan" />
            </div>
            <div className="flex items-center gap-2">
              <p>Termin:</p>
              <SelectForm
                name={"timeWant"}
                elements={times}
                placeholder="Termin"
              />
            </div>
          </div>
          <p className="mt-4">Kontakt telefon (za viber):</p>
          <Input
            name="phoneNumber"
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
                type={"submit"}
                className="bg-blue-700 text-white hover:bg-blue-700/80"
                disabled={createOffer.isPending}
              >
                Potvrdi
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogDescription>
    </DialogContent>
  );
}
