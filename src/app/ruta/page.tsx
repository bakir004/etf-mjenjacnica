import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";

export default async function Dashboard() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  return <HydrateClient>nigga</HydrateClient>;
}
