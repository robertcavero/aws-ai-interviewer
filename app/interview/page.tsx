import { Suspense } from "react";
import InterviewChat from "@/components/InterviewChat";

export default function InterviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
            Loading interview session...
          </div>
        }
      >
        <InterviewChat />
      </Suspense>
    </main>
  );
}