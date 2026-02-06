export default function LadderInspectorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">
      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-32">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with General Safety Regulation 6 of the Occupational
        Health and Safety Act (Act 85 of 1993), the employer must ensure that
        all ladders are inspected regularly by a competent person. You are
        hereby appointed as the Ladder Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect all ladders before use and at prescribed intervals.</li>
        <li>Ensure ladders are structurally sound, clean, and free from defects.</li>
        <li>Tag defective ladders and remove them from service immediately.</li>
        <li>Maintain inspection records as required by GSR 6.</li>
        <li>Report unsafe conditions or misuse of ladders to management.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>
        I, {appointee}, accept this appointment and understand my duties in
        accordance with GSR 6.
      </p>
    </div>
  );
}

