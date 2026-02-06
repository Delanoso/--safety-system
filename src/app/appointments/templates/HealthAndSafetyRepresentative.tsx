export default function HealthAndSafetyRepresentativeTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-72">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with Sections 17 and 18 of the Occupational Health and Safety
        Act (Act 85 of 1993), the employer must appoint Health and Safety
        Representatives. You are hereby appointed as the Health and Safety
        Representative for your workplace effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Conduct workplace inspections and identify hazards.</li>
        <li>Report unsafe conditions and assist with corrective actions.</li>
        <li>Participate in incident investigations and committee meetings.</li>
        <li>Promote safe work practices among employees.</li>
        <li>Represent employees’ safety concerns to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under Sections 17 & 18.</p>
    </div>
  );
}

