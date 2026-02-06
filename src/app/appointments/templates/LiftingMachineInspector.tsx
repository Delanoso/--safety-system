export default function LiftingMachineInspectorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-64">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of Driven Machinery Regulation 18 of the Occupational Health and
        Safety Act (Act 85 of 1993), lifting machines must be inspected and tested
        by a competent Lifting Machine Inspector (LMI). You are hereby appointed as
        the Lifting Machine Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect cranes, hoists, forklifts, and lifting machines as required by DMR 18.</li>
        <li>Conduct load tests and certify lifting machines as safe for use.</li>
        <li>Ensure compliance with SANS and DMR 18 requirements.</li>
        <li>Maintain inspection and certification records.</li>
        <li>Report unsafe lifting equipment immediately.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under DMR 18.</p>
    </div>
  );
}

