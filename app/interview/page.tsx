import { Suspense } from "react";
import InterviewChat from "@/components/InterviewChat";

export default function InterviewPage() {
  return (
    <main className="h-screen flex flex-col">
      <Suspense
        fallback={
          <div className="flex items-center justify-center flex-1 text-slate-400">
            Loading interview session...
          </div>
        }
      >
        <InterviewChat />
      </Suspense>
    </main>
  );
}