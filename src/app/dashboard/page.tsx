"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardData = {
  totalIncidents: number;
  unsignedAppointments: number;
  trainingCompliance: number;
  ppeStockAlerts: number;
  incidentsOverTime: { month: string; count: number }[];
  medicalsByType: { name: string; count: number }[];
  visitorsOnSite: number;
  activePermits: number;
  complianceReviewOverdue: number;
  contractorsLowCompliance: number;
  avgContractorCompliance: number;
  inductionsExpiringSoon: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((json) => {
        if (json && typeof json.totalIncidents === "number") {
          setData({
            totalIncidents: json.totalIncidents,
            unsignedAppointments: json.unsignedAppointments ?? 0,
            trainingCompliance: json.trainingCompliance ?? 0,
            ppeStockAlerts: json.ppeStockAlerts ?? 0,
            incidentsOverTime: Array.isArray(json.incidentsOverTime) ? json.incidentsOverTime : [],
            medicalsByType: Array.isArray(json.medicalsByType) ? json.medicalsByType : [],
            visitorsOnSite: json.visitorsOnSite ?? 0,
            activePermits: json.activePermits ?? 0,
            complianceReviewOverdue: json.complianceReviewOverdue ?? 0,
            contractorsLowCompliance: json.contractorsLowCompliance ?? 0,
            avgContractorCompliance: json.avgContractorCompliance ?? 100,
            inductionsExpiringSoon: json.inductionsExpiringSoon ?? 0,
          });
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null));
  }, []);

  const loading = data === null;
  const d = data ?? {
    totalIncidents: 0,
    unsignedAppointments: 0,
    trainingCompliance: 0,
    ppeStockAlerts: 0,
    incidentsOverTime: [],
    medicalsByType: [],
    visitorsOnSite: 0,
    activePermits: 0,
    complianceReviewOverdue: 0,
    contractorsLowCompliance: 0,
    avgContractorCompliance: 100,
    inductionsExpiringSoon: 0,
  };

  const formatMonth = (m: string) => {
    const [y, mo] = m.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(mo || "1", 10) - 1]} ${y}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* KPI Cards – each linked to the module that supplies the metric */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/incidents/list" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Total Incidents</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : d.totalIncidents}
            </p>
          </Card>
        </Link>

        <Link href="/appointments/request-signature" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Unsigned Appointments</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : d.unsignedAppointments}
            </p>
          </Card>
        </Link>

        <Link href="/training/certificates/list" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Training Compliance</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : `${d.trainingCompliance}%`}
            </p>
          </Card>
        </Link>

        <Link href="/ppe-management/stock-list" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">PPE Stock Alerts</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : d.ppeStockAlerts}
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link href="/visitor-register/list?onSite=true" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Visitors On Site</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : d.visitorsOnSite}
            </p>
          </Card>
        </Link>

        <Link href="/permit-to-work/list" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Active Permits</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : d.activePermits}
            </p>
          </Card>
        </Link>

        <Link href="/legal-compliance" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Compliance Reviews Overdue</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : d.complianceReviewOverdue}
            </p>
          </Card>
        </Link>

        <Link href="/contractors" className="block min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold">Contractor Compliance</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">
              {loading ? "…" : `${d.avgContractorCompliance}%`}
            </p>
            {!loading && d.contractorsLowCompliance > 0 && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {d.contractorsLowCompliance} below 80%
              </p>
            )}
          </Card>
        </Link>
      </div>

      {/* Charts Row – Incidents graph → Incidents module, Medicals graph → Medicals module */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <Link href="/incidents/list" className="block transition opacity-100 hover:opacity-95 min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Incidents Over Time</h3>
            <div className="h-64">
              {d.incidentsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={d.incidentsOverTime.map((i) => ({
                      ...i,
                      label: formatMonth(i.month),
                    }))}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                    <Tooltip
                      formatter={(v: number) => [v, "Incidents"]}
                      labelFormatter={(l) => l}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--gold, #d4a853)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No incident data yet
                </div>
              )}
            </div>
          </Card>
        </Link>

        <Link href="/medicals/list" className="block transition opacity-100 hover:opacity-95 min-w-0">
          <Card>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Medicals by Type</h3>
            <div className="h-64">
              {d.medicalsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={d.medicalsByType}
                    layout="vertical"
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-40" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(v: number) => [v, "Count"]}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--gold, #d4a853)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No medical data yet
                </div>
              )}
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
