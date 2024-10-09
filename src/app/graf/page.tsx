import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";
// import GraphView from "../_components/graphview";
import dynamic from "next/dynamic";

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

const GraphViewNoSSR = dynamic(() => import("../_components/graphview"), {
  ssr: false, // This disables SSR for this component
});

export default async function GraphPage() {
  const offers = await api.offer.getAll();
  return (
    <div>
      <GraphViewNoSSR offers={offers}></GraphViewNoSSR>
    </div>
  );
}
