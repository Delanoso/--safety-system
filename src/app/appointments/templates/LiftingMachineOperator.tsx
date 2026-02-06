export default function LiftingMachineOperatorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-48">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with Driven Machinery Regulation 18(11) of the Occupational
        Health and Safety Act (Act 85 of 1993), only trained and competent persons
        may operate lifting machines. You are hereby appointed as a Lifting Machine
        Operator effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Operate lifting machines safely and within rated capacity.</li>
        <li>Conduct pre‑use inspections and report defects immediately.</li>
        <li>Ensure loads are secured, balanced, and stable before lifting.</li>
        <li>Follow all signals from trained lifting signalers.</li>
        <li>Comply with DMR 18 and internal lifting procedures.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under DMR 18.</p>
    </div>
  );
}

