import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser, User } from "@clerk/nextjs/server";

import { api } from "~/trpc/server";
import Offer from "./offer";

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

export default async function OfferList() {
  const offers = await api.offer.getAll();
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {offers.length === 0 ? (
        <p className="italic">Nema trenutno aktivnih razmjena</p>
      ) : (
        offers.map((item: Offer, i) => <Offer offer={item} key={i}></Offer>)
      )}
    </div>
  );
}
