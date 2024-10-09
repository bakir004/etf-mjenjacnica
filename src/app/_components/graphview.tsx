import { SignedIn, SignedOut } from "@clerk/nextjs";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import { Graph } from "react-graph-vis";

import "./styles.css";
import "./network.css";

import { api } from "~/trpc/server";
import Offer from "./offer";

export interface Offer {
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

export default async function OfferList() {
  const offers = await api.offer.getAll();
  const graph = {
    nodes: [
      { id: 1, label: "Node 1", title: "node 1 tootip text" },
      { id: 2, label: "Node 2", title: "node 2 tootip text" },
      { id: 3, label: "Node 3", title: "node 3 tootip text" },
      { id: 4, label: "Node 4", title: "node 4 tootip text" },
      { id: 5, label: "Node 5", title: "node 5 tootip text" },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
    ],
  };

  const options = {
    layout: {
      hierarchical: true,
    },
    edges: {
      color: "#000000",
    },
    height: "500px",
  };

  const events = {
    select: function (event: { nodes: any; edges: any }) {
      var { nodes, edges } = event;
    },
  };
  return (
    <Graph
      graph={graph}
      options={options}
      events={events}
      getNetwork={(network: any) => {
        //  if you want access to vis.js network api you can set the state in a parent component using this property
      }}
    />
  );
}
