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
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
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
  };

  const formatMonth = (m: string) => {
    const [y, mo] = m.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[parseInt(mo || "1", 10) - 1]} ${y}`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards – linked to modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/incidents">
          <Card>
            <h3 className="text-lg font-semibold">Total Incidents</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "…" : d.totalIncidents}
            </p>
          </Card>
        </Link>

        <Link href="/appointments/request-signature">
          <Card>
            <h3 className="text-lg font-semibold">Unsigned Appointments</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "…" : d.unsignedAppointments}
            </p>
          </Card>
        </Link>

        <Link href="/training">
          <Card>
            <h3 className="text-lg font-semibold">Training Compliance</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "…" : `${d.trainingCompliance}%`}
            </p>
          </Card>
        </Link>

        <Link href="/ppe-management">
          <Card>
            <h3 className="text-lg font-semibold">PPE Stock Alerts</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "…" : d.ppeStockAlerts}
            </p>
          </Card>
        </Link>
      </div>

      {/* Charts Row – linked to modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link href="/incidents" className="block transition opacity-100 hover:opacity-95">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Incidents Over Time</h3>
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

        <Link href="/medicals" className="block transition opacity-100 hover:opacity-95">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Medicals</h3>
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
