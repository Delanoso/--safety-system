export default function ScaffoldingInspectorTemplate({
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
        In accordance with Construction Regulation 16(1)(e), the employer must
        ensure that scaffolding is inspected by a competent person before use and
        at least once weekly. You are hereby appointed as the Scaffolding
        Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect scaffolding before use and weekly thereafter.</li>
        <li>Check for structural integrity, bracing, guardrails, and access.</li>
        <li>Tag scaffolding as safe, unsafe, or out of service.</li>
        <li>Record inspection findings and report hazards immediately.</li>
        <li>Ensure compliance with CR 16 and internal scaffolding procedures.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under CR 16.</p>
    </div>
  );
}

