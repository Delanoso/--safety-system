export default function FireMarshallTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-48">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of General Safety Regulation 3 and the company’s Emergency
        Preparedness Plan, the employer must appoint competent persons to assist
        in fire prevention and emergency response. You are hereby appointed as a
        Fire Marshall effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Assist in fire prevention, evacuation, and emergency response.</li>
        <li>Ensure escape routes and fire doors remain unobstructed.</li>
        <li>Guide employees to assembly points during evacuations.</li>
        <li>Report fire hazards and unsafe conditions immediately.</li>
        <li>Participate in fire drills and emergency training.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties as Fire Marshall.</p>
    </div>
  );
}

