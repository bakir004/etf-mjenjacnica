import { CreateOfferModal } from "./CreateOfferModal";
import React from "react";
import { Dialog, DialogTrigger } from "../../components/ui/dialog";
import { PlusIcon } from "@radix-ui/react-icons";

export function CreateOfferButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <PlusIcon className="h-6 w-6 cursor-pointer rounded bg-secondary p-0.5 text-white hover:bg-secondary/80"></PlusIcon>
      </DialogTrigger>
      <CreateOfferModal />
    </Dialog>
  );
}
