export default function FireAndEmergencyProtectionOfficerTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-[260px]">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with General Safety Regulation 3 and applicable emergency
        response legislation, the employer must appoint competent persons to
        manage fire and emergency preparedness. You are hereby appointed as the
        Fire and Emergency Protection Officer effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Coordinate fire prevention, emergency response, and evacuation plans.</li>
        <li>Ensure fire equipment is inspected, serviced, and accessible.</li>
        <li>Lead emergency drills and training sessions.</li>
        <li>Investigate fire incidents and recommend improvements.</li>
        <li>Ensure compliance with GSR 3 and internal emergency procedures.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties as Fire and Emergency Protection Officer.</p>
    </div>
  );
}

