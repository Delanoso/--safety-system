export default function HazardousChemicalSubstancesControllerTemplate({
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
        In accordance with the Hazardous Chemical Substances Regulations of the
        Occupational Health and Safety Act (Act 85 of 1993), the employer must
        ensure that hazardous chemicals are controlled, monitored, and handled by
        a competent person. You are hereby appointed as the Hazardous Chemical
        Substances Controller effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Maintain an up‑to‑date inventory of all hazardous substances.</li>
        <li>Ensure SDSs are available, current, and accessible.</li>
        <li>Monitor storage, handling, and disposal of chemicals.</li>
        <li>Ensure labeling and container integrity comply with HCS Regulations.</li>
        <li>Assist with exposure monitoring and PPE requirements.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under the HCS Regulations.</p>
    </div>
  );
}

