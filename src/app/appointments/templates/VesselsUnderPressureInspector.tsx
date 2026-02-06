export default function VesselsUnderPressureInspectorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-56">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of the Pressure Equipment Regulations (PER) and SANS 347, the
        employer must ensure that pressure vessels and related equipment are
        inspected and maintained by a competent person. You are hereby appointed
        as the Vessels Under Pressure Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect pressure vessels, compressors, and boilers as required by PER.</li>
        <li>Verify safety valves, gauges, and protective devices are functional.</li>
        <li>Ensure vessels are operated within safe pressure limits.</li>
        <li>Maintain inspection records and report defects immediately.</li>
        <li>Ensure compliance with PER and SANS 347 requirements.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under PER.</p>
    </div>
  );
}

