export default function FireTeamMemberTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-56">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with General Safety Regulation 3 and the company’s Emergency
        Response Plan, the employer must appoint trained persons to assist with
        fire response. You are hereby appointed as a Fire Team Member effective
        {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Assist in fire response, containment, and evacuation.</li>
        <li>Operate fire extinguishers and suppression equipment safely.</li>
        <li>Support Fire Marshalls during emergency situations.</li>
        <li>Participate in fire drills and emergency training.</li>
        <li>Report fire hazards and unsafe conditions immediately.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties as a Fire Team Member.</p>
    </div>
  );
}

