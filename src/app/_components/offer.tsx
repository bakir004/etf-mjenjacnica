"use client";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { TrashIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Dialog, DialogTrigger } from "../../components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import clsx from "clsx";
import { useUser } from "@clerk/nextjs";

import { Offer } from "@prisma/client";
import DeleteOfferModal from "~/app/_components/DeleteOfferModal";
// import { subjectColor } from "~/lib/constants";
export const subjectColor: Record<string, string> = {
  ASP: "bg-blue-800 hover:bg-blue-800/80",
  DM: "bg-red-600 hover:bg-red-600/80",
  RPR: "bg-orange-600 hover:bg-orange-600/80",
  LD: "bg-green-600 hover:bg-green-600/80",
  OBP: "bg-purple-600 hover:bg-purple-600/80",
  NA: "bg-yellow-500 hover:bg-yellow-500/80",
  SP: "bg-rose-600 hover:bg-rose-600/80",
};
export default function OfferItem({
  offer,
  key,
}: {
  offer: Offer;
  key: number;
}) {
  const { user } = useUser();

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
                <TrashIcon className="text-white-500 ml-auto h-6 w-6 cursor-pointer rounded bg-red-600 p-0.5 hover:bg-red-600/80"></TrashIcon>
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
        <DeleteOfferModal id={offer.id} />
      </Dialog>
    </Alert>
  );
}
