export default function PollutionControllerTemplate({
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
        In terms of the Environmental Regulations for Workplaces and the National
        Environmental Management Act (NEMA), the employer must ensure that
        pollution and environmental risks are controlled by a competent person.
        You are hereby appointed as the Pollution Controller effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Monitor and control pollution risks including spills, emissions, and waste.</li>
        <li>Ensure spill kits and environmental controls are maintained.</li>
        <li>Report environmental incidents and assist with corrective actions.</li>
        <li>Ensure waste is stored, handled, and disposed of correctly.</li>
        <li>Assist with environmental awareness and training.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under NEMA.</p>
    </div>
  );
}

