export default function FirstAidMarshallTemplate({
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
        In accordance with General Safety Regulation 3, the employer must ensure
        that trained persons are appointed to assist with first aid and emergency
        response. You are hereby appointed as a First Aid Marshall effective {date}.
      </p>

      <h3 className="font-semibold text-lg">Duties and Responsibilities</h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Assist First Aiders during medical emergencies.</li>
        <li>Help maintain first aid boxes and emergency equipment.</li>
        <li>Support evacuation and emergency procedures.</li>
        <li>Report injuries and unsafe conditions immediately.</li>
        <li>Participate in emergency drills and training.</li>
      </ul>

      <h3 className="font-semibold text-lg">Acceptance of Appointment</h3>
      <p>I, {appointee}, accept this appointment and understand my duties under GSR 3.</p>
    </div>
  );
}

