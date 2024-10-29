import { TestPage } from "./../_components/TestPage";
import { HydrateClient } from "~/trpc/server";
import SuspenseWrapper from "../_components/LoadingSuspenseWrapper";

export default async function AspPage() {
  return (
    <SuspenseWrapper>
      <HydrateClient>
        <TestPage />
      </HydrateClient>
    </SuspenseWrapper>
  );
}
