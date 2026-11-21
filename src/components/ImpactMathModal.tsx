"use client";

import React, { useEffect, useRef } from "react";
import { X, Calculator, ShieldCheck } from "lucide-react";
import { ImpactMetrics } from "@/types/airQuality";

interface ImpactMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  impactMetrics?: ImpactMetrics;
  actionTitle?: string;
}

export const ImpactMathModal: React.FC<ImpactMathModalProps> = ({
  isOpen,
  onClose,
  impactMetrics,
  actionTitle,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store element that had focus before opening modal
    if (typeof document !== "undefined") {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

    // Auto-focus first interactive element
    const timer = setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap for Tab and Shift+Tab
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      if (previouslyFocusedElement.current && typeof previouslyFocusedElement.current.focus === "function") {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="math-modal-title"
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 id="math-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Direct Impact Calculation Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic epidemiological & thermodynamic heuristics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close calculation breakdown"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {actionTitle && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-0.5">
                Active Intervention
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {actionTitle}
              </span>
            </div>
          )}

          {/* Specific Computed Numbers */}
          {impactMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                  Exposure Cut
                </span>
                <span className="text-xl font-extrabold text-teal-700 dark:text-teal-300">
                  {impactMetrics.exposureReductionPercent}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  Dose Saved
                </span>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {impactMetrics.doseSavedUgPerDay} µg
                </span>
                <span className="text-[10px] text-slate-500 block">per person/day</span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block">
                  CO2 Avoided
                </span>
                <span className="text-xl font-extrabold text-sky-700 dark:text-sky-300">
                  {impactMetrics.co2SavedKgPerWeek} kg
                </span>
                <span className="text-[10px] text-slate-500 block">per week</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                  PM2.5 Aerosol Avoided
                </span>
                <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300">
                  {Math.round(impactMetrics.pm25EmissionsAvoidedKgPerWeek * 1000)} g
                </span>
                <span className="text-[10px] text-slate-500 block">per week</span>
              </div>
            </div>
          )}

          {/* Formula Callout */}
          {impactMetrics?.calculationFormula && (
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 dark:bg-slate-950 font-mono text-[11px] border border-slate-800">
              <span className="text-slate-400 block mb-1 font-sans text-[10px] uppercase font-bold tracking-wider">
                Deterministic Governing Equation
              </span>
              <code>{impactMetrics.calculationFormula}</code>
            </div>
          )}

          {/* Variables Table */}
          {impactMetrics?.breakdownVariables && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Input Parameters & Heuristics
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs" aria-label="Variables and input parameters used in impact equation">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th scope="col" className="p-2.5">Variable</th>
                      <th scope="col" className="p-2.5">Model Value</th>
                      <th scope="col" className="p-2.5">Source Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(impactMetrics.breakdownVariables).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                          {key}
                        </td>
                        <td className="p-2.5 font-mono text-teal-700 dark:text-teal-400 font-semibold">
                          {String(val)}
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          US EPA / WHO Air Quality Standard
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Scientific Methodology Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Strict Separation of Concerns Protocol
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              The AI layer in this application does <strong>not</strong> invent, estimate, or hallucinate numerical impact statistics. All values are calculated strictly by <code>src/utils/impactCalculator.ts</code> using peer-reviewed physiological ventilation formulas and official IPCC emission factors. The GenAI prompt is injected with these exact computed constants to generate empathetic explanations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
