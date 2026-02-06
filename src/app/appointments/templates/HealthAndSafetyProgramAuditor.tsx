export default function HealthAndSafetyProgramAuditorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-52">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with General Administrative Regulation 9 and internal audit
        requirements aligned with ISO 45001, the employer must ensure that the
        health and safety management system is periodically audited by a competent
        person. You are hereby appointed as the Health and Safety Program Auditor
        effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Conduct internal audits of the health and safety management system.</li>
        <li>Evaluate compliance with legal and procedural requirements.</li>
        <li>Identify non‑conformances and recommend corrective actions.</li>
        <li>Verify the effectiveness of implemented controls.</li>
        <li>Prepare audit reports and present findings to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties as Program Auditor.</p>
    </div>
  );
}

