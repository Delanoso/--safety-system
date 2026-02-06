export default function GasWeldingAndCuttingEquipmentInspectorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-64">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with General Safety Regulation 9 and SANS 10238, the employer
        must ensure that gas welding and cutting equipment is inspected and
        maintained by a competent person. You are hereby appointed as the Gas
        Welding and Cutting Equipment Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect gas cylinders, hoses, regulators, and torches for defects.</li>
        <li>Ensure flashback arrestors and safety devices are installed and functional.</li>
        <li>Verify safe storage and segregation of oxygen and fuel gases.</li>
        <li>Remove unsafe equipment from service immediately.</li>
        <li>Maintain inspection records and enforce hot‑work safety rules.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under GSR 9.</p>
    </div>
  );
}

