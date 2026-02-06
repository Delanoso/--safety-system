export default function HealthAndSafetyCommitteeMemberTemplate({
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
        In accordance with Sections 19 and 20 of the Occupational Health and Safety
        Act (Act 85 of 1993), the employer must establish a Health and Safety
        Committee and appoint members to participate. You are hereby appointed as a
        Health and Safety Committee Member effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Attend committee meetings and participate in discussions.</li>
        <li>Review incident reports, inspections, and safety performance.</li>
        <li>Make recommendations to improve workplace safety.</li>
        <li>Assist in promoting health and safety awareness.</li>
        <li>Represent employees’ safety concerns to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under Sections 19 & 20.</p>
    </div>
  );
}

