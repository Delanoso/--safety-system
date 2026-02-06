"use client";

import { useMemo, useRef } from "react";
import templates, {
  AppointmentTemplateKey,
  AppointmentTemplateProps,
  templateRegistry,
  TEMPLATE_VERSION,
} from "../app/appointments/templates";

interface AppointmentLetterViewerProps {
  appointment: {
    id: string;
    type: AppointmentTemplateKey;
    appointee: string;
    appointer: string;
    department: string;
    date: string;
    notes?: string;
    appointeeSignature?: string;
    appointerSignature?: string;
    appointeeSignedAt?: string | null;
    appointerSignedAt?: string | null;
  };
}

export default function AppointmentLetterViewer({
  appointment,
}: AppointmentLetterViewerProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

  const meta = useMemo(
    () => templateRegistry.find((t) => t.key === appointment.type),
    [appointment.type]
  );

  const Template =
    templates[appointment.type] as React.ComponentType<AppointmentTemplateProps>;
    console.log("VIEWER APPOINTMENT:", appointment);

  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="
          rounded-xl p-4 md:p-6
          bg-[rgba(255,255,255,0.55)] dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-md border border-[rgba(0,0,0,0.12)]
          dark:border-[rgba(255,255,255,0.15)]
          flex flex-col md:flex-row md:items-center md:justify-between gap-4
        "
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
            {appointment.type}
          </h2>

          {meta && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {meta.regulation} · v{meta.version || TEMPLATE_VERSION}
            </p>
          )}

          {meta && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {meta.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="
            px-4 py-2 rounded-xl font-semibold text-sm
            bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(15,30,60,0.85)]
            border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)]
            hover:scale-[1.03] hover:border-[var(--gold)] hover:shadow-lg
            transition-all duration-300
          "
        >
          Download / Print PDF
        </button>
      </div>

      {/* Printable area */}
      <div
        ref={printRef}
        className="
          rounded-xl p-6 md:p-8 shadow-lg
          bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(10,20,40,0.98)]
          border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.12)]
          text-[var(--foreground)]
        "
      >
        <Template
          appointee={appointment.appointee}
          appointer={appointment.appointer}
          department={appointment.department}
          date={appointment.date}
        />

        {/* Signatures */}
        <div className="mt-10 pt-6 border-t border-dashed border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)] space-y-6">
          <h3 className="font-semibold text-lg">Signatures</h3>

          <div className="grid md:grid-cols-2 gap-8 text-sm">
            {/* Appointer */}
            <div className="space-y-2">
              <p className="font-semibold">Appointer</p>
              <p>Name: {appointment.appointer}</p>

              <div className="mt-4">
                <p className="font-semibold mb-2">Signature:</p>

                {appointment.appointerSignature ? (
                  <img
                    src={appointment.appointerSignature}
                    alt="Appointer Signature"
                    className="h-24 object-contain border border-[rgba(0,0,0,0.2)] rounded-lg bg-white p-2"
                  />
                ) : (
                  <p>_______________________________</p>
                )}

                {/* AUTO-FILLED DATE */}
                <p className="mt-2">
                  Date:{" "}
                  {appointment.appointerSignedAt
                    ? new Date(
                        appointment.appointerSignedAt
                      ).toLocaleDateString()
                    : "______________________________"}
                </p>
              </div>
            </div>

            {/* Appointee */}
            <div className="space-y-2">
              <p className="font-semibold">Appointee</p>
              <p>Name: {appointment.appointee}</p>
              <p>Department: {appointment.department}</p>

              <div className="mt-4">
                <p className="font-semibold mb-2">Signature:</p>

                {appointment.appointeeSignature ? (
                  <img
                    src={appointment.appointeeSignature}
                    alt="Appointee Signature"
                    className="h-24 object-contain border border-[rgba(0,0,0,0.2)] rounded-lg bg-white p-2"
                  />
                ) : (
                  <p>_______________________________</p>
                )}

                {/* AUTO-FILLED DATE */}
                <p className="mt-2">
                  Date:{" "}
                  {appointment.appointeeSignedAt
                    ? new Date(
                        appointment.appointeeSignedAt
                      ).toLocaleDateString()
                    : "______________________________"}
                </p>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-6">
              <p className="font-semibold text-sm mb-1">Additional Notes</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

