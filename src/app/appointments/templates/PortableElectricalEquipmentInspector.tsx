export default function PortableElectricalEquipmentInspectorTemplate({
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
        In terms of the Electrical Machinery Regulations and SANS 10142-1, the
        employer must ensure that all portable electrical equipment is inspected
        and tested by a competent person. You are hereby appointed as the
        Portable Electrical Equipment Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Inspect and test portable electrical tools and appliances.</li>
        <li>Ensure compliance with SANS 10142-1 testing intervals.</li>
        <li>Tag equipment as safe, unsafe, or out of service.</li>
        <li>Maintain detailed inspection and testing records.</li>
        <li>Report unsafe equipment or electrical hazards immediately.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>
        I, {appointee}, accept this appointment and understand my duties under
        the Electrical Machinery Regulations.
      </p>
    </div>
  );
}

