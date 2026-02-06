export default function SecurityCoordinatorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-44">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of General Safety Regulation 2 and internal security procedures,
        the employer must ensure that workplace security risks are managed by a
        competent person. You are hereby appointed as the Security Coordinator
        effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Coordinate access control and site security measures.</li>
        <li>Monitor CCTV, alarms, and perimeter security systems.</li>
        <li>Respond to security incidents and conduct investigations.</li>
        <li>Ensure compliance with emergency and evacuation procedures.</li>
        <li>Report security risks and recommend improvements.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties as Security Coordinator.</p>
    </div>
  );
}

