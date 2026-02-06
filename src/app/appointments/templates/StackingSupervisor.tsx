export default function StackingSupervisorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-40">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with General Safety Regulation 8 of the Occupational Health
        and Safety Act (Act 85 of 1993), the employer must ensure that all
        stacking and storage of materials is supervised by a competent person.
        You are hereby appointed as the Stacking Supervisor effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Ensure materials are stacked safely, securely, and in accordance with GSR 8.</li>
        <li>Prevent unsafe stacking heights, unstable loads, and blocked walkways.</li>
        <li>Inspect stacking areas daily and correct unsafe conditions immediately.</li>
        <li>Ensure mechanical lifting equipment is used safely where required.</li>
        <li>Report stacking hazards and incidents to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under GSR 8.</p>
    </div>
  );
}

