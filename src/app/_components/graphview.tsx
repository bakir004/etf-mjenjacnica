"use client";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { darkTheme } from "reagraph";

import { api } from "~/trpc/server";
import Offer from "./offer";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
const subjectColor: Record<string, string> = {
  ASP: "#1e40af",
  DM: "#dc2626",
  RPR: "#ea580c",
  LD: "#16a34a",
  OBP: "#9333ea",
  NA: "#eab308",
  SP: "#e11d48",
};
export default function GraphView({ offers }: { offers: Offer[] }) {
  const [nodes, setNodes] = useState<
    {
      label: string;
      id: string;
      fill: string;
    }[]
  >([]);
  const [edges, setEdges] = useState<
    {
      id: string;
      source: string;
      target: string;
    }[]
  >([]);
  useEffect(() => {
    const newNodes: {
      label: string;
      id: string;
      fill: string;
    }[] = [];
    const newEdges: {
      id: string;
      source: string;
      target: string;
    }[] = [];
    let i = 0;
    offers.forEach((offer) => {
      const node1 = {
        label: offer.subjectGive + " " + offer.dayGive + " " + offer.timeGive,
        id: offer.subjectGive + " " + offer.dayGive + " " + offer.timeGive,
        fill: subjectColor[offer.subjectGive] ?? "",
      };
      const node2 = {
        label: offer.subjectWant + " " + offer.dayWant + " " + offer.timeWant,
        id: offer.subjectWant + " " + offer.dayWant + " " + offer.timeWant,
        fill: subjectColor[offer.subjectWant] ?? "",
      };
      i++;
      if (newNodes.filter((item) => item.label === node1.label).length === 0)
        newNodes.push(node1);
      if (newNodes.filter((item) => item.label === node2.label).length === 0)
        newNodes.push(node2);
      const edge1 = {
        id: `${i - 1}-${i - 2}`,
        source: offer.subjectGive + " " + offer.dayGive + " " + offer.timeGive,
        target: offer.subjectWant + " " + offer.dayWant + " " + offer.timeWant,
      };
      // const edge2 = {
      //   id: `${i - 2}-${i - 1}`,
      //   source: `${i - 2}`,
      //   target: `${i - 1}`,
      // };
      newEdges.push(edge1);
      // newEdges.push(edge2);
    });
    setEdges([...newEdges]);
    setNodes([...newNodes]);
  }, [offers]);
  return (
    <div>
      {/* {typeof window !== undefined ? ( */}
      <GraphCanvasNoSSR theme={darkTheme} nodes={nodes} edges={edges} />
      {/* ) : null} */}
    </div>
  );
}
