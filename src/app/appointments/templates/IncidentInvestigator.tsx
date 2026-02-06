export default function IncidentInvestigatorTemplate({
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
        In terms of General Administrative Regulation 9 of the Occupational
        Health and Safety Act (Act 85 of 1993), the employer must ensure that
        all workplace incidents are investigated by a competent person. You are
        hereby appointed as an Incident Investigator with effect from {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Conduct investigations into all workplace incidents, near misses, and injuries.</li>
        <li>Identify root causes and contributing factors using accepted investigation methods.</li>
        <li>Compile formal investigation reports and submit them to management.</li>
        <li>Recommend corrective and preventative actions to prevent recurrence.</li>
        <li>Ensure all investigations comply with GAR 9 and internal procedures.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>
        I, {appointee}, accept this appointment and confirm that I understand my
        duties as required by the Act and company procedures.
      </p>
    </div>
  );
}

