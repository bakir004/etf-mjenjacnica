"use client";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  StarIcon,
  StopwatchIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import clsx from "clsx";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface Offer {
  id: number;
  phoneNumber: string;
  creatorId: string;
  creatorName: string;
  subjectGive: string;
  timeGive: string;
  dayGive: string;
  subjectWant: string;
  timeWant: string;
  dayWant: string;
  createdAt: Date;
}
const subjectColor: Record<string, string> = {
  ASP: "bg-blue-800 hover:bg-blue-800/80",
  DM: "bg-red-600 hover:bg-red-600/80",
  RPR: "bg-orange-600 hover:bg-orange-600/80",
  LD: "bg-green-600 hover:bg-green-600/80",
  OBP: "bg-purple-600 hover:bg-purple-600/80",
  NA: "bg-yellow-500 hover:bg-yellow-500/80",
  SP: "bg-rose-600 hover:bg-rose-600/80",
};

export default function Offer({ offer, key }: { offer: Offer; key: number }) {
  const { user } = useUser();
  const utils = api.useUtils();
  const router = useRouter();

  const deleteOffer = api.offer.deleteOffer.useMutation({
    onSuccess: async () => {
      void utils.offer.getAll.invalidate(); // Invalidate the cache to refresh the offer list
      toast.success("Ponuda uspjesno obrisana"); // Show success notification
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Greska na serveru: ${error.message}`); // Show error notification
    },
  });
  return (
    <Alert key={key}>
      <Dialog>
        <AlertTitle className="">
          <div className="flex w-full items-center gap-2">
            <p className="text-sm italic text-white">
              {offer.creatorName} - {offer.phoneNumber}
            </p>
            {user?.id === offer.creatorId ? (
              <DialogTrigger asChild>
                <TrashIcon className="ml-auto h-4 w-4 cursor-pointer text-red-500"></TrashIcon>
              </DialogTrigger>
            ) : null}
          </div>
        </AlertTitle>
        <AlertDescription>
          <div className="mt-5 flex flex-col items-center justify-between gap-2">
            <Badge className="relative flex w-full gap-2 border-gray-400 bg-transparent bg-opacity-0 px-1 py-1 text-white hover:bg-transparent sm:px-2 sm:py-2">
              <p className="absolute -top-5 left-0 italic text-gray-400">
                Nudi:
              </p>
              <Badge
                className={clsx(subjectColor[offer.subjectGive], "text-white")}
              >
                {offer.subjectGive}
              </Badge>
              <span>
                {offer.dayGive.slice(0, 3)}, {offer.timeGive}
              </span>
            </Badge>
            <UpdateIcon className="h-6 w-6"></UpdateIcon>
            <Badge className="relative flex w-full gap-2 border-gray-400 bg-transparent bg-opacity-0 px-1 py-1 text-white hover:bg-transparent sm:px-2 sm:py-2">
              <p className="absolute -top-5 left-0 italic text-gray-400">
                Traži:
              </p>
              <Badge
                className={clsx(subjectColor[offer.subjectWant], "text-white")}
              >
                {offer.subjectWant}
              </Badge>
              <span>
                {offer.dayWant.slice(0, 3)}, {offer.timeWant}
              </span>
            </Badge>
          </div>
        </AlertDescription>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Dodaj razmjenu grupa</DialogTitle>
            <div>Jeste li sigurni da želite obrisati ovu razmjenu?</div>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant={"outline"}>Zatvori</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant={"destructive"}
                  onClick={() => deleteOffer.mutate({ id: offer.id })}
                >
                  Obriši
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Alert>
  );
}
