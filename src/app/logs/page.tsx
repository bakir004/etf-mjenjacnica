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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { PersonIcon } from "@radix-ui/react-icons";
import { Badge } from "~/components/ui/badge";

const mergeConsecutiveLogs = (logs: any) => {
  const mergedLogs: any[] = [];
  let currentGroup: any[] = [];
  logs.forEach((log: any) => {
    delete log.code;
    if (
      currentGroup.length === 0 ||
      log.senderEmail === currentGroup[0].senderEmail
    )
      currentGroup.push(log);
    else {
      mergedLogs.push(currentGroup);
      currentGroup = [];
    }
  });
  return mergedLogs;
};

export default async function Logs() {
  const logs = await api.coderunner.getRequests();
  const uniqueEmails = new Set(logs.map((log) => log.senderEmail));
  const uniqueEmailCount = uniqueEmails.size;

  logs.sort((a: any, b: any) => b.createdAt - a.createdAt);
  const mergedLogs = mergeConsecutiveLogs(logs);
  return (
    <SuspenseWrapper>
      <HydrateClient>
        <main className="mx-auto max-w-[1280px] p-4 sm:mt-12">
          <div className="mb-4 flex items-center gap-2 text-2xl font-bold">
            Logs ({logs.length}) - <PersonIcon className="h-6 w-6"></PersonIcon>{" "}
            {uniqueEmailCount}
          </div>
          <Accordion type="single" collapsible className="w-full">
            {mergedLogs.map((logGroup: any, i: number) => (
              <AccordionItem value={`item-${i}`} key={i}>
                <AccordionTrigger>
                  <span>
                    <Badge
                      className={`mr-4 rounded-full px-1.5 font-bold text-white ${logGroup.length > 20 ? "bg-red-600" : logGroup.length > 10 ? "bg-orange-600" : logGroup.length === 1 ? "bg-blue-600" : "bg-green-700"}`}
                    >
                      {logGroup.length}
                    </Badge>{" "}
                    <span className="text-slate-400">
                      {logGroup[logGroup.length - 1].createdAt.toLocaleString()}{" "}
                      -{" "}
                      {logGroup[0].createdAt.toLocaleDateString() ===
                      logGroup[
                        logGroup.length - 1
                      ].createdAt.toLocaleDateString()
                        ? logGroup[0].createdAt.toLocaleTimeString()
                        : logGroup[0].createdAt.toLocaleString()}
                    </span>{" "}
                    <span className="ml-8">{logGroup[0].senderName}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Id</TableHead>
                        <TableHead>Vakat</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logGroup.map((log: any, j: number) => (
                        <TableRow key={j}>
                          <TableCell>{log.id}</TableCell>
                          <TableCell>
                            {log.createdAt.toLocaleString()}
                          </TableCell>
                          <TableCell>{log.senderEmail}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </main>
      </HydrateClient>
    </SuspenseWrapper>
  );
}
