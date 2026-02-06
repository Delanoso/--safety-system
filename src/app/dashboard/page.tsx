import Card from "@/components/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-lg font-semibold">Total Incidents</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Open Inspections</h3>
          <p className="text-3xl font-bold mt-2">7</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Training Compliance</h3>
          <p className="text-3xl font-bold mt-2">86%</p>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">PPE Stock Alerts</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Incidents Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Risk Assessment Categories</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>
        </Card>
      </div>

      {/* Table / Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Slip injury – Warehouse</li>
            <li>• Chemical spill – Workshop</li>
            <li>• Minor burn – Kitchen</li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Upcoming Training</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• First Aid – 24 Jan</li>
            <li>• Fire Safety – 28 Jan</li>
            <li>• Working at Heights – 30 Jan</li>
          </ul>
        </Card>
      </div>

    </div>
  );
}

