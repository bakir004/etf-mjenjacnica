import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";
import GraphView from "../_components/graphview";

interface Offer {
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

export default async function GraphPage() {
  const offers = await api.offer.getAll();
  return (
    <div>
      <GraphView offers={offers}></GraphView>
    </div>
  );
}
