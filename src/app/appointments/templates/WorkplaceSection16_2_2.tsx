export default function WorkplaceSection16_2_2_Template({
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
        In terms of Section 16(2) of the Occupational Health and Safety Act (Act 85
        of 1993), the employer must appoint competent persons to assist in ensuring
        compliance with the Act. You are hereby appointed as the Workplace Section
        16(2)(2) Responsible Person effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Assist management in implementing health and safety requirements.</li>
        <li>Ensure workplace hazards are identified and controlled.</li>
        <li>Monitor compliance with safe work procedures.</li>
        <li>Report incidents, unsafe acts, and unsafe conditions.</li>
        <li>Support the CEO and 16(2)(1) appointee in legal compliance.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under Section 16(2).</p>
    </div>
  );
}

