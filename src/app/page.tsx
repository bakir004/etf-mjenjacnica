import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  const { userId } = auth();
  let user = null;
  if (userId) user = await currentUser();
  // void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main>asd</main>
    </HydrateClient>
  );
}
