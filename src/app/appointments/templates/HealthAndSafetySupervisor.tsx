export default function HealthAndSafetySupervisorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-44">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of Construction Regulation 8 and General Safety Regulation 2, the
        employer must ensure that work is supervised by a competent person. You are
        hereby appointed as the Health and Safety Supervisor effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Supervise work activities to ensure compliance with safety procedures.</li>
        <li>Identify hazards and ensure corrective actions are implemented.</li>
        <li>Ensure workers use PPE and follow safe work practices.</li>
        <li>Conduct toolbox talks and safety briefings.</li>
        <li>Report incidents, unsafe acts, and unsafe conditions to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under CR 8.</p>
    </div>
  );
}

