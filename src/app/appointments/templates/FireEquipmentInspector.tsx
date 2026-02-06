export default function FireEquipmentInspectorTemplate({
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
        In accordance with General Safety Regulation 3 and SANS 1475, the employer
        must ensure that fire equipment is inspected and maintained by a competent
        person. You are hereby appointed as the Fire Equipment Inspector effective
        {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect fire extinguishers, hose reels, hydrants, and fire blankets.</li>
        <li>Ensure equipment is serviced, certified, and within inspection intervals.</li>
        <li>Check pressure gauges, seals, signage, and accessibility.</li>
        <li>Report missing, damaged, or discharged equipment immediately.</li>
        <li>Maintain fire equipment inspection registers.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under GSR 3.</p>
    </div>
  );
}

