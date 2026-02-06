export default function LiftingEquipmentInspectorTemplate({
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
        In accordance with Driven Machinery Regulation 18 of the Occupational
        Health and Safety Act (Act 85 of 1993), the employer must ensure that all
        lifting equipment and lifting tackle are inspected by a competent person.
        You are hereby appointed as the Lifting Equipment Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect lifting tackle, slings, chains, hooks, and lifting devices.</li>
        <li>Ensure equipment is marked, certified, and within inspection intervals.</li>
        <li>Remove defective lifting equipment from service immediately.</li>
        <li>Maintain inspection registers as required by DMR 18.</li>
        <li>Report unsafe lifting practices to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under DMR 18.</p>
    </div>
  );
}

