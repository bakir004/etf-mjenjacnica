import { api, HydrateClient } from "~/trpc/server";
import dynamic from "next/dynamic";

const GraphViewNoSSR = dynamic(() => import("../_components/GraphView"), {
  ssr: false,
});

export default async function GraphPage() {
  const offers = await api.offer.getAll();
  return (
    <HydrateClient>
      <GraphViewNoSSR offers={offers}></GraphViewNoSSR>
    </HydrateClient>
  );
}
