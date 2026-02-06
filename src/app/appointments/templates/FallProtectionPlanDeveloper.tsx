export default function FallProtectionPlanDeveloperTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-60">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with Construction Regulation 10 of the Occupational Health
        and Safety Act (Act 85 of 1993), the employer must ensure that a Fall
        Protection Plan is developed by a competent person. You are hereby
        appointed as the Fall Protection Plan Developer effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Develop, implement, and maintain the Fall Protection Plan.</li>
        <li>Identify fall hazards and specify control measures.</li>
        <li>Ensure anchor points, lifelines, and harness systems comply with standards.</li>
        <li>Specify training requirements for workers exposed to fall risks.</li>
        <li>Review and update the plan when conditions or risks change.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under CR 10.</p>
    </div>
  );
}

