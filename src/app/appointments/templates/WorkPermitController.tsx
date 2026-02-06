export default function WorkPermitControllerTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-32">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of General Safety Regulation 2 and Construction Regulation 8,
        the employer must ensure that hazardous work is controlled and
        supervised by a competent person. You are hereby appointed as the Work
        Permit Controller effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Issue, control, and close all permit‑to‑work documents.</li>
        <li>Verify that all hazards are identified and controlled before work begins.</li>
        <li>Ensure that only competent persons perform high‑risk tasks.</li>
        <li>Stop unsafe work and enforce compliance with permit conditions.</li>
        <li>Maintain accurate permit records for auditing and legal compliance.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>
        I, {appointee}, accept this appointment and understand my duties under
        GSR 2 and CR 8.
      </p>
    </div>
  );
}

