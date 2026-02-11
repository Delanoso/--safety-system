"use client";

export default function RelevantDocumentsPage() {
  const docs = [
    {
      title: "WCL 1 – Employer’s Report of Accident",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL1.pdf",
      description:
        "Completed by employers to report an accident at work. Must be submitted within 7 days of the incident. Includes employer details, employee details, and accident description.",
    },
    {
      title: "WCL 2 – Notice of Accident and Claim for Compensation",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL2.pdf",
      description:
        "Completed by the injured employee to notify the Compensation Commissioner of an accident and to claim compensation.",
    },
    {
      title: "WCL 3 – Employer’s Report of Occupational Disease",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL3.pdf",
      description:
        "Used by employers to report an occupational disease caused by workplace exposure. Must be submitted within 14 days of diagnosis.",
    },
    {
      title: "WCL 4 – First Medical Report",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL4.pdf",
      description:
        "Completed by the treating doctor after the first consultation. Includes diagnosis, injury details, and estimated time off work.",
    },
    {
      title: "WCL 5 – Progress Medical Report",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL5.pdf",
      description:
        "Completed by a medical practitioner to provide updates on the employee’s recovery and treatment progress.",
    },
    {
      title: "WCL 6 – Final Medical Report",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL6.pdf",
      description:
        "Completed by a medical practitioner once the employee has recovered or reached maximum medical improvement.",
    },
    {
      title: "WCL 14 – Exposure Incident Report",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL14.pdf",
      description:
        "Used to report exposure to hazardous biological or chemical agents, even if no injury has occurred yet.",
    },
    {
      title: "WCL 22 – Final Progress Report",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL22.pdf",
      description:
        "Completed by a medical practitioner to provide final progress details before the final medical report.",
    },
    {
      title: "WCL 26 – Resumption Report",
      link: "https://www.labour.gov.za/DocumentCenter/Forms/Compensation%20for%20Occupational%20Injuries%20and%20Diseases/WCL26.pdf",
      description:
        "Completed by employers when an injured employee returns to work. Includes return date and work capacity.",
    },
    {
      title: "RMA – First Medical Report",
      link: "https://www.randmutual.co.za/media/First-Medical-Report.pdf",
      description:
        "Completed by a medical practitioner for injuries covered under Rand Mutual Assurance (mining & metals sectors).",
    },
    {
      title: "RMA – Progress Medical Report",
      link: "https://www.randmutual.co.za/media/Progress-Medical-Report.pdf",
      description:
        "Used to provide updates on treatment and recovery for RMA-covered employees.",
    },
    {
      title: "RMA – Final Medical Report",
      link: "https://www.randmutual.co.za/media/Final-Medical-Report.pdf",
      description:
        "Completed when the employee has recovered or reached maximum medical improvement.",
    },
    {
      title: "RMA Online Claims Portal",
      link: "https://www.randmutual.co.za/claims",
      description:
        "Official RMA portal for submitting claims, uploading documents, and tracking injury-on-duty cases.",
    },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Relevant Documentation</h1>
        <p className="text-black/70">
          Official COIDA and RMA forms required for workplace injuries and occupational diseases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((doc, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
            >
              <h2 className="text-xl font-bold text-black mb-2">{doc.title}</h2>
              <p className="text-black/70 text-sm mb-4">{doc.description}</p>

              <a
                href={doc.link}
                target="_blank"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                Open Document
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
