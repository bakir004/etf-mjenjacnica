import { HydrateClient } from "~/trpc/server";
import SuspenseWrapper from "../_components/LoadingSuspenseWrapper";
import { api } from "~/trpc/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default async function Logs() {
  const logs = await api.coderunner.getRequests();
  return (
    <SuspenseWrapper>
      <HydrateClient>
        <main className="mx-auto max-w-[1280px] p-4 sm:mt-12">
          <h1 className="mb-4 text-2xl font-bold">Logs</h1>
          <Table className="mt-4 border-b border-neutral-500">
            <TableHeader>
              <TableRow className="border border-neutral-500">
                <TableHead className="w-[50px] border-r border-neutral-500">
                  Id
                </TableHead>
                <TableHead className="border-r border-neutral-500">
                  Vakat
                </TableHead>
                <TableHead className="border-r border-neutral-500">
                  Ime i prezime
                </TableHead>
                <TableHead className="">Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {logs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell className="border-x border-neutral-500">
                    {log.id}
                  </TableCell>
                  <TableCell className="border-r border-neutral-500">
                    {log.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell className="border-r border-neutral-500">
                    {log.senderName}
                  </TableCell>
                  <TableCell className="border-r border-neutral-500">
                    {log.senderEmail}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </main>
      </HydrateClient>
    </SuspenseWrapper>
  );
}
