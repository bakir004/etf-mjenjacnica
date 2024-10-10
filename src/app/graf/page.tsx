import { api } from "~/trpc/server";
import dynamic from "next/dynamic";

const GraphViewNoSSR = dynamic(() => import("../_components/graphview"), {
  ssr: false,
});

export default async function GraphPage() {
  const offers = await api.offer.getAll();
  return <GraphViewNoSSR offers={offers}></GraphViewNoSSR>;
}
