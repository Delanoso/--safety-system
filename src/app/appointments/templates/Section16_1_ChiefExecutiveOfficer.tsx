export default function Section16_1_ChiefExecutiveOfficerTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="font-semibold w-[260px]">To</td>
            <td>{appointee}</td>
          </tr>
          <tr>
            <td className="font-semibold">From</td>
            <td>{appointer}</td>
          </tr>
          <tr>
            <td className="font-semibold">Department</td>
            <td>{department}</td>
          </tr>
        </tbody>
      </table>

      <p>
        In accordance with Section 16(1) of the Occupational Health and Safety Act
        (Act 85 of 1993), the Chief Executive Officer is charged with the overall
        responsibility for ensuring compliance with the Act. You are hereby
        appointed as the Section 16(1) Chief Executive Officer effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Ensure the organisation complies with all applicable OHS legislation.</li>
        <li>Provide resources to implement and maintain the OHS management system.</li>
        <li>Appoint competent persons to assist in fulfilling OHS duties.</li>
        <li>Review safety performance and ensure continual improvement.</li>
        <li>Promote a culture of safety throughout the organisation.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>
        I, {appointee}, accept this appointment and acknowledge my legal duties
        under Section 16(1) of the OHS Act.
      </p>
    </div>
  );
}

