"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LoadingSpinnerSVG from "~/app/_components/Spinner";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function DeleteOfferModal({ id }: { id: number }) {
  const utils = api.useUtils();
  const router = useRouter();
  const deleteOffer = api.offer.deleteOffer.useMutation({
    onSuccess: async () => {
      void utils.offer.getAll.invalidate(); // Invalidate the cache to refresh the offer list
      toast.success("Ponuda uspjesno obrisana"); // Show success notification
      router.refresh();
      toast.dismiss("deleting");
    },
    onError: (error) => {
      toast.error(`Greska na serveru: ${error.message}`); // Show error notification
      toast.dismiss("deleting");
    },
  });
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-xl">Obriši razmjenu grupa?</DialogTitle>
      </DialogHeader>
      <DialogDescription asChild>
        <div className="flex flex-col gap-4">
          <h2>Jeste li sigurni da želite obrisati ovu razmjenu?</h2>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button className="ml-auto" variant={"outline"}>
                Zatvori
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant={"destructive"}
                onClick={() => {
                  toast.loading(
                    <div className="flex items-center gap-2 font-bold">
                      <LoadingSpinnerSVG></LoadingSpinnerSVG>
                      Procesuiramo vaš zahtjev...
                    </div>,
                    {
                      id: "deleting",
                      duration: 999999,
                    },
                  );
                  deleteOffer.mutate({
                    id,
                  });
                }}
              >
                Obriši
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogDescription>
    </DialogContent>
  );
}
