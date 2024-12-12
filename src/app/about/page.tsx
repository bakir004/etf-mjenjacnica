import { HydrateClient } from "~/trpc/server";
import SuspenseWrapper from "../_components/LoadingSuspenseWrapper";
import { Badge } from "~/components/ui/badge";

export default async function AboutPage() {
  return (
    <SuspenseWrapper>
      <main className="mx-auto flex max-w-[1280px] flex-col items-start gap-4 p-4 text-justify">
        <h1 className="text-xl font-bold">O Zmangeru</h1>
        <p>
          Dobrodošli na Zmanger za studente Elektrotehničkog fakulteta u
          Sarajevu. Cilj ove aplikacije je poboljšati iskustvo studenata.
          Aplikacija (zasad) nudi dvije usluge: pregled razmjena termina i
          testiranje C++ koda za aktuelne zadaće.
        </p>
        <h2 className="font-bold">Pregled razmjena termina</h2>
        <p>
          Na vrhu stranice imate dugme &quot;Prijavi se&quot;. Prijavom
          omogućavate sebi kreiranje razmjena (klikom na &quot;+&quot; u ćošku)
          da svi drugi vide. Kada kreirate razmjenu, pisaće ime sa vašeg
          githuba/gmaila i vaš broj telefona koji ste unijeli, u svrhu potvrde
          da je broj i osoba kojoj se javljate korektna.
        </p>
        <p>
          Kada se dogovorite sa kolegom oko zamjene, obrišite razmjenu sa ove
          stranice klikom na crvenu kantu u vašoj razmjeni.
        </p>
        <p>
          Na grafičkom prikazu, tumač je slijedeći: čvorovi predstavljaju
          termine, a strelice se kreću od termina koji se nude i ulaze u termine
          koji se traže. Ciklusi u grafiku znači da je moguć dogovor između
          osoba čiji se termini pronađu u tom ciklusu.
        </p>
        <h2 className="font-bold">Testiranje C++ koda</h2>
        <p>
          Prijavom u ovu aplikaciju sa @etf.unsa.ba emailom dobijate pristup
          testiranju koda za aktuelne zadaće iz predmeta TP, ASP i NA. Nakon
          prijave, pokazaće vam se dugme &quot;Testovi&quot; na traci na vrhu
          stranice. Ostale upute, napomene i upozorenja se nalaze na toj
          stranici.
        </p>
        <p>
          Nadam se da ćete s ovom aplikacijom imati bolje iskustvo sa nekim
          frustrirajućim stvarima sa fakulteta. :{")"}
        </p>
        <em className="-mt-4 text-sm text-gray-400">- bc</em>

        <h1 className="text-xl font-bold">Patch notes</h1>
        <ul className="flex list-inside flex-col gap-2">
          <li className="items-start gap-2 sm:flex">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="grow-0 text-nowrap">31 Oct 2024</Badge>
              <Badge className="bg-blue-700 text-white">0.4.1</Badge>
            </div>
            Detekcija curenja memorije.
          </li>
          <li className="items-start gap-2 sm:flex">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="grow-0 text-nowrap">29 Oct 2024</Badge>
              <Badge className="bg-blue-700 text-white">0.4</Badge>
            </div>
            Logovi. Onemogućen pristup testovima sa nefakultetskih emailova.
          </li>
          <li className="items-start gap-2 sm:flex">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="grow-0 text-nowrap">26 Oct 2024</Badge>
              <Badge className="bg-blue-700 text-white">0.3.2</Badge>
            </div>
            Testovi za NA. Testovi se šalju i vraćaju u batchevima u realnom
            vremenu. Poboljšan procesor na serveru. Popravljene
            nekonzistentnosti na frontendu.
          </li>
          <li className="items-start gap-2 sm:flex">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="grow-0 text-nowrap">25 Oct 2024</Badge>
              <Badge className="bg-blue-700 text-white">0.3.1</Badge>
            </div>
            Testiranje koda za ASP zadaće. Preimenovanje aplikacije u Zmanger.
          </li>
          <li className="items-start gap-2 sm:flex">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="grow-0 text-nowrap">9 Oct 2024</Badge>
              <Badge className="bg-blue-700 text-white">0.2</Badge>
            </div>
            Izborni predmeti: SP i NA. Grafički prikaz za razmjene.
          </li>
          <li className="items-start gap-2 sm:flex">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="grow-0 text-nowrap">8 Oct 2024</Badge>{" "}
              <Badge className="bg-blue-700 text-white">0.1</Badge>
            </div>
            Prva verzija aplikacije, mogućnost dodavanja termina uz uslov
            prijave. Upute za korištenje aplikacije.
          </li>
        </ul>
      </main>
    </SuspenseWrapper>
  );
}
