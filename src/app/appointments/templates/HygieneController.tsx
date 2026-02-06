export default function HygieneControllerTemplate({
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
        In terms of the Environmental Regulations for Workplaces and applicable
        Hazardous Chemical Substances Regulations, the employer must ensure that
        workplace hygiene is monitored and controlled by a competent person. You
        are hereby appointed as the Hygiene Controller effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Monitor workplace cleanliness, ventilation, and hygiene standards.</li>
        <li>Ensure sanitary facilities are maintained and compliant.</li>
        <li>Identify hygiene risks and recommend corrective actions.</li>
        <li>Assist with biological and chemical exposure control measures.</li>
        <li>Maintain hygiene inspection records.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under the Environmental Regulations.</p>
    </div>
  );
}

