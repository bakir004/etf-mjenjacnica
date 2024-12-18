"use client";
import React from "react";
import { TestTable } from "./TestTable";
import { useUser } from "@clerk/nextjs";

export function TestPage({ fileNames }: { fileNames: string[] }) {
  const user = useUser();
  const email = user.user?.emailAddresses[0]?.emailAddress;

  return (
    <main className="mx-auto max-w-[1600px] p-4 sm:mt-12">
      {email?.endsWith("@etf.unsa.ba") ||
      user.user?.fullName === "Bakir Cinjarevic" ||
      user.user?.fullName === "Danijal Alibegovic" ? (
        <>
          <h1 className="mb-4 text-lg font-bold sm:text-2xl">
            Testovi za zadaće iz ASP/NA
          </h1>

          <div className="font-bold text-blue-400">
            Odaberite predmet, unesite svoj C++ kod u polje ispod, zatim
            kliknite na dugme &quot;Pokreni&quot;.{" "}
            <p className="font-bold text-red-500">
              (Nemojte unositi funkciju main!)
            </p>
          </div>
          <TestTable fileNames={fileNames} />
          <p className="mt-2 font-bold italic">
            Napomene: Ovi testovi nisu 100% mjerodavni iz sljedećih razloga:
          </p>
          <ul className="ml-4 mt-2 list-disc italic">
            <li>
              Testovi se izvršavaju na remote serveru koji nije brz, pa se neki
              testovi mogu obilježiti kao execution timeout nakon 10s.
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
            <li>
              Ako vam test ne prolazi (u boxu za vaš izlaz piše: &quot;Execution
              error:&quot;, bez objašnjenja), to je greška koju kompajler nije
              uspio dijagnosticirati. U tom slučaju, ova stranica ne može
              utvrditi tačnost (ili netačnost) tog testa. U slučaju sličnih
              neobičnosti, testirajte na zamgeru kao dosad.
            </li>
          </ul>
          <p className="mt-2">
            U slučaju čekanja testova duže od minute, vjerovatno je spor server
            ili se zakrčio. Prijavite problem tako da se server može
            restartovati/ubrzati.
          </p>
        </>
      ) : (
        <p className="text-red-500">
          Ova stranica je dostupna samo za studente Elektrotehničkog fakulteta
          Univerziteta u Sarajevu.
        </p>
      )}
    </main>
  );
}
