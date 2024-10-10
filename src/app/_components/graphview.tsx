"use client";
import { darkTheme, GraphCanvas } from "reagraph";

import { useEffect, useState } from "react";
import { subjectColorHex } from "~/lib/constants";
import { Offer } from "@prisma/client";

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
        fill: subjectColorHex[offer.subjectGive] ?? "",
      };
      const node2 = {
        label: offer.subjectWant + " " + offer.dayWant + " " + offer.timeWant,
        id: offer.subjectWant + " " + offer.dayWant + " " + offer.timeWant,
        fill: subjectColorHex[offer.subjectWant] ?? "",
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
      newEdges.push(edge1);
    });
    setEdges([...newEdges]);
    setNodes([...newNodes]);
  }, [offers]);
  return <GraphCanvas theme={darkTheme} nodes={nodes} edges={edges} />;
}
