export default function FirstAiderTemplate({
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
        In accordance with General Safety Regulation 3 of the Occupational Health
        and Safety Act (Act 85 of 1993), the employer must appoint trained First
        Aiders. You are hereby appointed as a First Aider effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide first aid treatment during injuries and medical emergencies.</li>
        <li>Maintain first aid boxes and ensure supplies are stocked.</li>
        <li>Record all treatments in the first aid register.</li>
        <li>Assist with emergency response and evacuation procedures.</li>
        <li>Report serious injuries to management immediately.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and confirm that I am trained as a First Aider.</p>
    </div>
  );
}

