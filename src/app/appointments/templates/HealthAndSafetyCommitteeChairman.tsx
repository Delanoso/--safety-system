export default function HealthAndSafetyCommitteeChairmanTemplate({
  appointee,
  appointer,
  department,
  date,
}: {
  appointee: string;
  appointer: string;
  department: string;
  date: string;
}) {
  return (
    <div className="space-y-6 text-[var(--foreground)] leading-relaxed text-sm md:text-base">
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="font-semibold w-32">To</td>
            <td>{appointee}</td>
          </tr>
          <tr>
            <td className="font-semibold">From</td>
            <td>{appointer}</td>
          </tr>
          <tr>
            <td className="font-semibold">Depot</td>
            <td>{department}</td>
          </tr>
        </tbody>
      </table>

      <p>
        I, {appointer}, having been appointed in terms of Section 16 (2) (2) of
        the Occupational Health and Safety Act (85 of 1993), hereby appoint you
        as Chairman of the Health and Safety Committee for the following period:
      </p>

      <p>
        From: {date || "______________"} &nbsp;&nbsp;&nbsp; To: ______________
      </p>

      <h3 className="font-semibold text-lg mt-4">Duties and Responsibilities</h3>

      <ul className="list-disc pl-6 space-y-2">
        <li>Perform all the duties of a Chairman of the Health and Safety Committee.</li>
        <li>Endorse all Health and Safety Committee records and recommendations.</li>
        <li>Ensure minutes are signed and countersigned by the 16(2) assignee.</li>
      </ul>

      <p>
        Please confirm your acceptance of this appointment by signing and
        returning the duplicate copy of this letter to the undersigned.
      </p>

      <h3 className="font-semibold text-lg mt-4">Acceptance of Appointment</h3>

      <p>
        I accept the appointment above and confirm that I have studied the
        relevant sections of the Act and understand what is required of me.
      </p>

      <p>
        SIGNED at _____________________ on this _______ day of _______________
        20______.
      </p>

      <table className="w-full text-sm mt-4">
        <tbody>
          <tr>
            <td className="font-semibold w-48">Name and Surname</td>
            <td>{appointee}</td>
            <td className="font-semibold w-64">Signature SHE Committee Chairman</td>
            <td>____________________</td>
            <td className="font-semibold w-24">Date</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

