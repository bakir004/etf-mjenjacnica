import { TestPage } from "./../_components/TestPage";
import { api, HydrateClient } from "~/trpc/server";
import SuspenseWrapper from "../_components/LoadingSuspenseWrapper";

export default async function AspPage() {
  const fileNames = await api.coderunner.getTestFileNames();

  return (
    <SuspenseWrapper>
      <HydrateClient>
        <TestPage fileNames={fileNames} />
      </HydrateClient>
    </SuspenseWrapper>
  );
}
