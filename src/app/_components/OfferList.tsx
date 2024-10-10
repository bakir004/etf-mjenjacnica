import type { Offer } from "@prisma/client";
import OfferItem from "./Offer";
import { api } from "~/trpc/server";

export default async function OfferList() {
  const offers = await api.offer.getAll();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {offers.length === 0 ? (
        <p className="italic">Nema trenutno aktivnih razmjena</p>
      ) : (
        offers.map((item: Offer, i: number) => (
          <OfferItem offer={item} key={i}></OfferItem>
        ))
      )}
    </div>
  );
}
