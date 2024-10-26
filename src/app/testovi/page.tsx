import { TestTable } from "../_components/TestTable";
import { HydrateClient } from "~/trpc/server";
import SuspenseWrapper from "../_components/LoadingSuspenseWrapper";

export default async function AspPage() {
  return (
    <SuspenseWrapper>
      <HydrateClient>
        <main className="mx-auto max-w-[1280px] p-4 sm:mt-12">
          <h1 className="mb-4 text-lg font-bold sm:text-2xl">
            Testovi za trenutnu zadaću iz ASP/NA
          </h1>

          <p>
            Odaberite predmet, unesite svoj C++ kod u polje ispod, zatim
            kliknite na dugme &quot;Pokreni&quot;. (Nemojte unositi funkciju
            main!)
          </p>
          <TestTable />
          <p className="mt-2 italic">
            Napomene: Ovi testovi nisu 100% mjerodavni iz sljedećih razloga:
          </p>
          <ul className="ml-4 mt-2 list-disc italic">
            <li>
              Testovi se izvršavaju na remote serveru koji nije brz, pa se neki
              testovi mogu obilježiti kao execution timeout nakon 10s.
            </li>
            <li>
              Ovaj kompajler ne detektuje curenje memorije kao na zamgeru.
            </li>
            <li>
              Vrlo moguć je compiler mismatch između ovog i zamgera, ali
              vjerovatno neće biti problem.
            </li>
            <li>
              Za neki test vam može reći da nije tačan, ali ustvari jeste, jer
              direktno poređenje izlaza vraća false zbog nekih viška razmaka
              koji se ne vide na zamgeru. U tom slučaju manuelno pogledajte da
              li vam se izlazi poklapaju.
            </li>
            <li>
              Moguće je da se neki testovi ne pojave zbog nepravilnog oblika
              JSONa koji je postavljen na c2. Uvijek će biti oblik fajla
              provjeren, ali se možda slučajno desi previd.
            </li>
          </ul>
          <p className="mt-2 italic">
            U slučaju čekanja testova duže od pola minute, vjerovatno je spor
            server ili se zakrčio. Prijavite problem tako da se server može
            restartovati/ubrzati.
          </p>
        </main>
      </HydrateClient>
    </SuspenseWrapper>
  );
}
