import { TestTable } from "./../_components/TestTable";
import { HydrateClient } from "~/trpc/server";
import SuspenseWrapper from "../_components/LoadingSuspenseWrapper";

export default async function AspPage() {
  return (
    <SuspenseWrapper>
      <HydrateClient>
        <main className="mx-auto max-w-[1280px] p-4 sm:mt-12">
          <h1 className="mb-4 text-lg font-bold sm:text-2xl">
            Testovi za trenutnu zadaću iz ASP
          </h1>
          <p>
            Unesite svoj C++ kod u polje ispod, zatim kliknite na dugme
            &quot;Pokreni&quot;.
          </p>
          <p>#include &lt;iostream&gt;</p>
          <p>using namespace std;</p>
          <p>int main() &#123;</p>
          <p> cout &lt;&lt; &quot;Hello, World!&quot; &lt;&lt; endl;</p>
          <p> return 0;</p>
          <p>&#125;</p>
          <TestTable />
        </main>
      </HydrateClient>
    </SuspenseWrapper>
  );
}
