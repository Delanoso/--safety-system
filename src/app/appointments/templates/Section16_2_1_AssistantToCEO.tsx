export default function Section16_2_1_AssistantToCEOTemplate({
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
          <tr><td className="font-semibold">From</td><td>{appointer} (CEO)</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with Section 16(2) of the Occupational Health and Safety Act
        (Act 85 of 1993), the Chief Executive Officer may appoint competent persons
        to assist in ensuring compliance with the Act. You are hereby appointed as
        the Section 16(2)(1) Assistant to the CEO effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Assist the CEO in fulfilling legal duties under the OHS Act.</li>
        <li>Ensure health and safety policies are implemented and maintained.</li>
        <li>Monitor compliance and report deviations to the CEO.</li>
        <li>Coordinate with managers and supervisors on safety matters.</li>
        <li>Promote a culture of safety throughout the organisation.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under Section 16(2).</p>
    </div>
  );
}

