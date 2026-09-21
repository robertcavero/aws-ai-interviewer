"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type Lang, translations } from "@/lib/i18n";

const TOTAL_QUESTIONS = 5;

type Message = {
  id: number;
  role: "ai" | "candidate";
  text: string;
};

type FeedbackReport = {
  technicalScore: number;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
};

export default function InterviewChat({
  jobDescription = "Full Stack Developer",
}: {
  jobDescription?: string;
}) {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") ?? "pt") as Lang;
  const t = translations[lang];

  const INITIAL_MESSAGES: Message[] = [
    { id: 1, role: "ai", text: t.welcomeMessage(TOTAL_QUESTIONS) },
  ];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const fetchDynamicQuestion = async (
    jobDesc: string,
    chatHistory: Message[],
  ) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDesc,
          lang,
          chatHistory: chatHistory.map((msg) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text,
          })),
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Failed to fetch the next question:", error);
      return t.connectionError;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isFinished || isLoading) return;

    const candidateMsg: Message = {
      id: messages.length + 1,
      role: "candidate",
      text: trimmed,
    };
    const updatedMessages = [...messages, candidateMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const nextQuestion = currentQuestion + 1;
    const finished = nextQuestion > TOTAL_QUESTIONS;

    if (finished) {
      const finalHistory = [
        ...updatedMessages,
        {
          id: updatedMessages.length + 1,
          role: "ai" as const,
          text: t.finishMessage,
        },
      ];
      setMessages(finalHistory);
      setCurrentQuestion(TOTAL_QUESTIONS);
      setIsFinished(true);
      setIsLoading(false);

      // Trigger the scorecard API
      finishInterview(finalHistory);
      return;
    }

    const aiResponseText = await fetchDynamicQuestion(
      jobDescription,
      updatedMessages,
    );

    const aiMsg: Message = {
      id: updatedMessages.length + 1,
      role: "ai",
      text: `${t.thankYou(nextQuestion, TOTAL_QUESTIONS)}\n\n${aiResponseText}`,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setCurrentQuestion(nextQuestion);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const finishInterview = async (finalHistory: Message[]) => {
    setIsGeneratingFeedback(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          chatHistory: finalHistory.map((msg) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text,
          })),
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setFeedback(data);
    } catch (error) {
      console.error("Error generating feedback:", error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  if (isGeneratingFeedback) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="font-medium">{t.generatingFeedback}</p>
      </div>
    );
  }

  if (feedback) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-3xl w-full p-5 sm:p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-slate-800">
            {t.finalScore(feedback.technicalScore)}
          </h2>

          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold text-emerald-600 mb-3 border-b border-slate-100 pb-2">
                {t.strengthsTitle}
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-rose-500 mb-3 border-b border-slate-100 pb-2">
                {t.weaknessesTitle}
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                {feedback.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-indigo-500 mb-3 border-b border-slate-100 pb-2">
                {t.tipsTitle}
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                {feedback.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            <div className="mt-10 flex justify-center border-t border-slate-200 pt-8">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition active:scale-95 shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                {t.backToStart}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = (currentQuestion / TOTAL_QUESTIONS) * 100;

  return (
    <div className="flex flex-col flex-1 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{t.aiName}</p>
            <p className="text-xs text-emerald-500 font-medium">{t.live}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs font-medium text-slate-500">
            {t.questionOf(
              Math.min(currentQuestion, TOTAL_QUESTIONS),
              TOTAL_QUESTIONS,
            )}
          </span>
          <div className="w-24 sm:w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${msg.role === "candidate" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === "ai"
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {msg.role === "ai" ? "AI" : t.candidateAvatar}
              </div>

              <div
                className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "ai"
                    ? "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                    : "bg-indigo-600 text-white rounded-br-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-2.5 flex-row">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-600">
                AI
              </div>
              <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-white border border-slate-200 text-slate-500 rounded-bl-sm shadow-sm flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input area */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isFinished
                ? t.finishedPlaceholder
                : isLoading
                  ? t.waitingPlaceholder
                  : t.inputPlaceholder
            }
            disabled={isFinished || isLoading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition max-h-40 overflow-y-auto focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isFinished || isLoading}
            className="shrink-0 w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white transition hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
