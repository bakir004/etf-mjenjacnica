import { Suspense } from "react";
import LoadingSpinnerSVG from "./Spinner";

export default async function SuspenseWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <span className="-mt-32">
            <LoadingSpinnerSVG></LoadingSpinnerSVG>
          </span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
