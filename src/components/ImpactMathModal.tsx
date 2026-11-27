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

    if (typeof document !== "undefined") {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

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
      if (previouslyFocusedElement.current && typeof previouslyFocusedElement.current.focus === "function") {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1A16]/80 backdrop-blur-sm animate-fadeIn"
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
        className="bg-[#1C2E27] rounded-2xl border border-[#2F4A3F] shadow-[0_24px_64px_rgba(0,0,0,0.65)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2F4A3F]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#2F4A3F] border border-[#94AE9F]/40 text-[#DCE7DF] flex items-center justify-center">
              <Calculator className="h-5 w-5 text-[#94AE9F]" />
            </div>
            <div>
              <h3 id="math-modal-title" className="text-base font-bold text-[#DCE7DF]">
                Direct Impact Calculation Breakdown
              </h3>
              <p className="text-xs text-[#94AE9F]/80">
                Deterministic epidemiological &amp; thermodynamic heuristics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close calculation breakdown"
            className="p-1.5 rounded-lg text-[#94AE9F] hover:text-[#DCE7DF] hover:bg-[#2F4A3F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#94AE9F]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-[#94AE9F] leading-relaxed">
          {actionTitle && (
            <div className="p-3.5 rounded-xl bg-[#0F1A16]/70 border border-[#2F4A3F]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#557566] block mb-0.5">
                Active Intervention
              </span>
              <span className="text-sm font-semibold text-[#DCE7DF]">
                {actionTitle}
              </span>
            </div>
          )}

          {/* Specific Computed Numbers */}
          {impactMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#0F1A16]/70 border border-[#94AE9F]/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                  Exposure Cut
                </span>
                <span className="text-xl font-extrabold text-[#DCE7DF]">
                  {impactMetrics.exposureReductionPercent}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1A16]/70 border border-[#2F4A3F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                  Dose Saved
                </span>
                <span className="text-xl font-extrabold text-emerald-300">
                  {impactMetrics.doseSavedUgPerDay} µg
                </span>
                <span className="text-[10px] text-[#557566] block">per person/day</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1A16]/70 border border-[#2F4A3F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                  CO2 Avoided
                </span>
                <span className="text-xl font-extrabold text-[#94AE9F]">
                  {impactMetrics.co2SavedKgPerWeek} kg
                </span>
                <span className="text-[10px] text-[#557566] block">per week</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1A16]/70 border border-[#2F4A3F]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#557566] block">
                  PM2.5 Avoided
                </span>
                <span className="text-xl font-extrabold text-amber-300">
                  {Math.round(impactMetrics.pm25EmissionsAvoidedKgPerWeek * 1000)} g
                </span>
                <span className="text-[10px] text-[#557566] block">per week</span>
              </div>
            </div>
          )}

          {/* Formula Callout */}
          {impactMetrics?.calculationFormula && (
            <div className="p-3.5 rounded-xl bg-[#0F1A16] text-[#DCE7DF] font-mono text-[11px] border border-[#2F4A3F]">
              <span className="text-[#557566] block mb-1 font-sans text-[10px] uppercase font-bold tracking-wider">
                Deterministic Governing Equation
              </span>
              <code>{impactMetrics.calculationFormula}</code>
            </div>
          )}

          {/* Variables Table */}
          {impactMetrics?.breakdownVariables && (
            <div>
              <h4 className="text-xs font-bold text-[#DCE7DF] uppercase tracking-wider mb-2">
                Input Parameters &amp; Heuristics
              </h4>
              <div className="border border-[#2F4A3F] rounded-xl overflow-hidden bg-[#0F1A16]/60">
                <table className="w-full text-left text-xs" aria-label="Variables and input parameters used in impact equation">
                  <thead className="bg-[#2F4A3F]/50 text-[#DCE7DF] font-semibold border-b border-[#2F4A3F]">
                    <tr>
                      <th scope="col" className="p-2.5">Variable</th>
                      <th scope="col" className="p-2.5">Model Value</th>
                      <th scope="col" className="p-2.5">Source Standard</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2F4A3F]/50">
                    {Object.entries(impactMetrics.breakdownVariables).map(([key, val]) => (
                      <tr key={key} className="hover:bg-[#2F4A3F]/25">
                        <td className="p-2.5 font-medium text-[#DCE7DF]">
                          {key}
                        </td>
                        <td className="p-2.5 font-mono text-[#94AE9F] font-semibold">
                          {String(val)}
                        </td>
                        <td className="p-2.5 text-[#557566] text-[11px]">
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
          <div className="p-4 rounded-xl bg-[#0F1A16]/65 border border-[#2F4A3F] space-y-1.5">
            <h4 className="font-bold text-[#DCE7DF] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#94AE9F]" />
              Strict Separation of Concerns Protocol
            </h4>
            <p className="text-[#94AE9F]">
              The AI layer in this application does <strong className="text-[#DCE7DF]">not</strong> invent, estimate, or hallucinate numerical impact statistics. All values are calculated strictly by <code className="text-[#DCE7DF]">src/utils/impactCalculator.ts</code> using peer-reviewed physiological ventilation formulas and official IPCC emission factors.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2F4A3F]/80 bg-[#0F1A16]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2F4A3F] border border-[#94AE9F]/60 text-[#DCE7DF] font-semibold text-xs hover:bg-[#557566] transition-colors focus:ring-2 focus:ring-[#94AE9F] focus:outline-none"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
