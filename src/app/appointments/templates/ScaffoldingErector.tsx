export default function ScaffoldingErectorTemplate({
  appointee,
  appointer,
  department,
  date,
}) {
  return (
    <div className="space-y-6 leading-relaxed text-[var(--foreground)]">

      <table className="w-full text-sm">
        <tbody>
          <tr><td className="font-semibold w-52">To</td><td>{appointee}</td></tr>
          <tr><td className="font-semibold">From</td><td>{appointer}</td></tr>
          <tr><td className="font-semibold">Department</td><td>{department}</td></tr>
        </tbody>
      </table>

      <p>
        In terms of Construction Regulation 16 of the Occupational Health and
        Safety Act (Act 85 of 1993), only trained and competent persons may erect
        scaffolding. You are hereby appointed as a Scaffolding Erector effective
        {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Erect scaffolding in accordance with CR 16 and manufacturer specifications.</li>
        <li>Ensure platforms, bracing, and guardrails are installed correctly.</li>
        <li>Use only approved components and report damaged items.</li>
        <li>Ensure scaffolding is stable, level, and secured.</li>
        <li>Work under supervision of a competent Scaffolding Inspector.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under CR 16.</p>
    </div>
  );
}

