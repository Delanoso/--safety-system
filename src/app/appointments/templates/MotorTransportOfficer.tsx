export default function MotorTransportOfficerTemplate({
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
        In accordance with Driven Machinery Regulation 17 and applicable Road Traffic
        legislation, the employer must ensure that vehicles and mobile equipment are
        operated and maintained safely. You are hereby appointed as the Motor
        Transport Officer effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Ensure all company vehicles are inspected, serviced, and roadworthy.</li>
        <li>Verify driver competency and licensing requirements.</li>
        <li>Maintain vehicle inspection and maintenance records.</li>
        <li>Investigate vehicle-related incidents and recommend improvements.</li>
        <li>Ensure compliance with DMR 17 and internal transport procedures.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under DMR 17.</p>
    </div>
  );
}

