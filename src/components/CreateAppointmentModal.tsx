"use client";

import { useEffect } from "react";

const appointmentTypes = [
  "Incident Investigator",
  "Ladder Inspector",
  "Earth Leakage Inspector",
  "Portable Electrical Equipment Inspector",
  "Work Permit Controller",
  "Stacking Supervisor",
  "Racking Safety Supervisor",
  "Lifting Equipment Inspector",
  "Hygiene Controller",
  "Hazardous Chemical Substances Controller",
  "Health and Safety Coordinator",
  "Health and Safety Supervisor",
  "Motor Transport Officer",
  "Security Coordinator",
  "Health and Safety Program Auditor",
  "Lifting Machine Operator",
  "Vessels Under Pressure Inspector",
  "Gas Welding and Cutting Equipment Inspector",
  "Scaffolding Erector",
  "Scaffolding Inspector",
  "Fall Protection Plan Developer",
  "Lifting Machine Inspector",
  "Fire Equipment Inspector",
  "Fire Marshall",
  "First Aid Marshall",
  "Pollution Controller",
  "Section 16(2)(1) - Assistant to the Chief Executive Officer",
  "Workplace Section 16(2)(2)",
  "Health and Safety Committee Chairman",
  "Health and Safety Committee Member",
  "Health and Safety Representative",
  "Accredited Installation Electrician",
  "First Aider",
  "Fire Team Member",
  "Fire and Emergency Protection Officer",
  "Section 16(1) Chief Executive Officer",
];

export default function CreateAppointmentModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}) {
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 flex items-center justify-center z-50
        bg-black/40 backdrop-blur-sm animate-fadeIn
      "
      onClick={onClose}
    >
      <div
        className="
          relative w-full max-w-3xl p-6 rounded-2xl
          bg-[rgba(255,255,255,0.55)]
          dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-xl
          border border-[rgba(0,0,0,0.15)]
          dark:border-[rgba(255,255,255,0.15)]
          shadow-2xl animate-scaleIn
          max-h-[90vh] overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
          Choose Appointment Type
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="
                group relative rounded-xl px-4 py-3 font-medium
                text-[var(--foreground)] transition-all duration-300

                bg-[rgba(255,255,255,0.55)]
                dark:bg-[rgba(30,60,120,0.45)]
                backdrop-blur-md

                border border-[rgba(0,0,0,0.15)]
                dark:border-[rgba(255,255,255,0.15)]

                hover:scale-[1.02]
                hover:shadow-xl
                hover:border-[var(--gold)]
              "
            >
              <span className="relative z-10">{type}</span>

              <div
                className="
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 pointer-events-none
                  bg-gradient-to-r
                  from-[rgba(255,255,255,0.4)]
                  via-transparent
                  to-[rgba(255,255,255,0.4)]
                  dark:from-[rgba(80,120,255,0.25)]
                  dark:to-[rgba(80,120,255,0.25)]
                "
              />
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg
              bg-gray-300 dark:bg-gray-700
              text-black dark:text-white
              hover:opacity-80 transition
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

