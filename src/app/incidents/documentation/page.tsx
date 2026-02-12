"use client";

const COID_FORMS =
  "https://www.labour.gov.za/DocumentCenter/Pages/Forms.aspx?RootFolder=%2FDocumentCenter%2FForms%2FCompensation%20for%20Occupational%20Injuries%20and%20Deseases";

export default function RelevantDocumentsPage() {
  const docs = [
    {
      title: "W.CL.1 – Employer’s Report of Accident",
      link: COID_FORMS,
      description:
        "Completed by employers to report an accident at work. Must be submitted within 7 days. Browse the COID forms folder to download.",
    },
    {
      title: "W.CL.2 – Notice of Accident and Claim for Compensation",
      link: COID_FORMS,
      description:
        "Completed by the injured employee to notify the Compensation Commissioner of an accident and to claim compensation.",
    },
    {
      title: "W.CL.3 – Employer’s Report of Occupational Disease",
      link: COID_FORMS,
      description:
        "Used by employers to report an occupational disease caused by workplace exposure. Must be submitted within 14 days of diagnosis.",
    },
    {
      title: "W.CL.4 – First Medical Report (Accident)",
      link: COID_FORMS,
      description:
        "Completed by the treating doctor after the first consultation. Includes diagnosis, injury details, and estimated time off work.",
    },
    {
      title: "W.CL.5 – Progress Medical Report",
      link: COID_FORMS,
      description:
        "Completed by a medical practitioner to provide updates on the employee’s recovery and treatment progress.",
    },
    {
      title: "W.CL.6 – Final Medical Report",
      link: COID_FORMS,
      description:
        "Completed by a medical practitioner once the employee has recovered or reached maximum medical improvement.",
    },
    {
      title: "W.CL.14 – Exposure Incident Report",
      link: COID_FORMS,
      description:
        "Used to report exposure to hazardous biological or chemical agents, even if no injury has occurred yet.",
    },
    {
      title: "W.CL.22 – First Medical Report (Occupational Disease)",
      link: "https://www.labour.gov.za/form-w-cl-22-first-medical-report-in-respect-of-an-occupational-disease",
      description:
        "Completed by a medical practitioner for occupational disease claims.",
    },
    {
      title: "W.CL.26 – Resumption Report",
      link: COID_FORMS,
      description:
        "Completed by employers when an injured employee returns to work. Includes return date and work capacity.",
    },
    {
      title: "RMA – Medical Reports (Mining & Metals)",
      link: "https://www.randmutual.co.za/claims",
      description:
        "Rand Mutual Assurance covers mining and metals. First, Progress, and Final Medical reports available via the RMA claims portal.",
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
                rel="noopener noreferrer"
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
