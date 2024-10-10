import { HydrateClient } from "~/trpc/server";

export default async function AboutPage() {
  return (
    <HydrateClient>
      <main className="mx-auto flex max-w-[1280px] flex-col items-start gap-4 p-4 text-justify">
        <h1 className="text-xl font-bold">Upute</h1>
        <p>
          Dobrodošli na grupomjenjačnicu za studente druge godine odsjeka RI.
          Cilj ove aplikacije je centralizovati sve zahtjeve za izmjene grupa, i
          na taj način dozvoliti svima pregled želja za izmjenu termina za
          vježbe.
        </p>
        <em className="text-sm">
          Napomena: aplikacija samo daje pregled razmjena, i ne podržava stvarnu
          izmjenu grupe. Na vama kao korisnicima je dužnost javiti se osobi s
          kojom se želite zamijeniti.
        </em>
        <p>
          Na vrhu stranice imate dugme &quot;Prijavi se&quot;. Prijavom
          omogućavate sebi kreiranje razmjena (klikom na &quot;+&quot; u ćošku)
          da svi drugi vide. Pri kreiranju nastojite popuniti sva polja
          korektno, jer aplikacija (još) nema nikakve validacije polja. Kada
          kreirate razmjenu, pisaće ime sa vašeg githuba/gmaila i vaš broj
          telefona koji ste unijeli, u svrhu potvrde da je broj i osoba kojoj se
          javljate korektna.
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
        <p>Nadam se da ćete s ovim uspjeti upasti na željene termine :{")"}</p>
        <em className="-mt-4 text-sm text-gray-400">- bc</em>
      </main>
    </HydrateClient>
  );
}
