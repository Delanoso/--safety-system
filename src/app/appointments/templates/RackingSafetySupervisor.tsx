export default function RackingSafetySupervisorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-40">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of SANS 10263 and SANS 289, and in accordance with General Safety
        Regulation 2, the employer must ensure that racking systems are inspected
        and maintained by a competent person. You are hereby appointed as the
        Racking Safety Supervisor effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect racking structures for damage, overloading, and instability.</li>
        <li>Ensure load ratings and signage are visible and enforced.</li>
        <li>Report damaged racking immediately and isolate unsafe areas.</li>
        <li>Ensure pallets and loads are placed safely and evenly.</li>
        <li>Maintain inspection records for auditing and compliance.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under SANS 10263.</p>
    </div>
  );
}

