export default function AccreditedInstallationElectricianTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-72">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In accordance with the Electrical Installation Regulations of the
        Occupational Health and Safety Act (Act 85 of 1993), only a registered
        and accredited Installation Electrician may perform, inspect, test, and
        certify electrical installations. You are hereby appointed as the
        Accredited Installation Electrician effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Perform electrical installation work in accordance with SANS 10142‑1.</li>
        <li>Inspect, test, and certify electrical installations as required by EIR.</li>
        <li>Issue Certificates of Compliance (CoCs) where applicable.</li>
        <li>Ensure electrical systems are safe, compliant, and properly maintained.</li>
        <li>Report electrical hazards and unsafe conditions immediately.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and confirm my registration as required by EIR.</p>
    </div>
  );
}

