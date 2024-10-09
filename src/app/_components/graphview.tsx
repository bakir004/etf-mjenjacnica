"use client";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { GraphCanvas, darkTheme } from "reagraph";

import { api } from "~/trpc/server";
import Offer from "./offer";
import dynamic from "next/dynamic";

// Dynamic import of GraphCanvas, disabling SSR for this component
const GraphCanvasNoSSR = dynamic(
  () => import("reagraph").then((mod) => mod.GraphCanvas),
  {
    ssr: false,
  },
);

interface Offer {
  id: number;
  phoneNumber: string;
  creatorId: string;
  creatorName: string;
  subjectGive: string;
  timeGive: string;
  dayGive: string;
  subjectWant: string;
  timeWant: string;
  dayWant: string;
  createdAt: Date;
}

export default function GraphView({ offers }: { offers: Offer[] }) {
  return (
    <div>
      <GraphCanvasNoSSR
        theme={darkTheme}
        nodes={[
          {
            id: "n-1",
            label: "RPR",
          },
          {
            id: "n-2",
            label: "2",
          },
        ]}
        edges={[
          {
            id: "1->2",
            source: "n-1",
            target: "n-2",
            label: "Edge 1-2",
          },
        ]}
      />
    </div>
  );
}
