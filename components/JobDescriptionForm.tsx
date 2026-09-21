"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Lang, translations, LANGUAGE_NAMES } from "@/lib/i18n";

const ROLES = [
  "Full-Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Mobile Developer",
  "Cloud Architect",
];

export default function JobDescriptionForm() {
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState("");
  const [lang, setLang] = useState<Lang>("pt");
  const router = useRouter();
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/interview?lang=${lang}`);
  };

  const chevron = (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{t.appTitle}</h1>
            <p className="text-sm text-slate-500">{t.appSubtitle}</p>
          </div>
          {/* Language selector */}
          <div className="relative shrink-0">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            >
              {(Object.keys(LANGUAGE_NAMES) as Lang[]).map((l) => (
                <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>
              ))}
            </select>
            {chevron}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              {t.jobDescriptionLabel}
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t.jobDescriptionPlaceholder}
              rows={6}
              required
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              {t.targetRoleLabel}
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                <option value="" disabled>{t.targetRolePlaceholder}</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {chevron}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            disabled={!jobDescription.trim() || !role}
          >
            {t.startButton}
          </button>
        </form>
      </div>
    </div>
  );
}
