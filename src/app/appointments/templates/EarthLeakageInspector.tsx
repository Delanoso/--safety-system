export default function EarthLeakageInspectorTemplate({
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
        In terms of the Electrical Installation Regulations and General
        Machinery Regulation 5, the employer must ensure that earth leakage
        devices are tested and maintained by a competent person. You are hereby
        appointed as the Earth Leakage Inspector effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Test all earth leakage devices at required intervals.</li>
        <li>Ensure compliance with SANS 10142-1 testing standards.</li>
        <li>Record all test results and report failures immediately.</li>
        <li>Ensure defective devices are removed from service and replaced.</li>
        <li>Advise management on electrical safety improvements.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>
        I, {appointee}, accept this appointment and understand my duties under
        the Electrical Installation Regulations.
      </p>
    </div>
  );
}

