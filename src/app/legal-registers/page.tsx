"use client";

export default function LegalRegistersPage() {
  // Links verified against gov.za, SAFLII consolidated acts/regs, and lawlibrary.org.za (Jan 2025)
  const docs = [
    // GENERAL HEALTH & SAFETY
    {
      title: "Occupational Health and Safety Act 85 of 1993 (OHSA)",
      pdf: "https://www.gov.za/sites/default/files/gcis_document/201409/act85of1993.pdf",
      html: "https://www.gov.za/documents/occupational-health-and-safety-act",
      description:
        "Primary legislation governing workplace health and safety in South Africa. Applies to all industries except mining.",
    },
    {
      title: "General Safety Regulations (GSR)",
      pdf: "https://www.saflii.org/za/legis/consol_reg/gsr255.pdf",
      html: "https://www.saflii.org/za/legis/consol_reg/gsr255/",
      description:
        "Regulations covering first aid, PPE, emergency procedures, confined spaces, and general workplace safety.",
    },
    {
      title: "General Machinery Regulations (GMR)",
      pdf: "https://www.saflii.org/za/legis/consol_reg/gmr272.pdf",
      html: "https://www.saflii.org/za/legis/consol_reg/gmr272/",
      description:
        "Regulates machinery operation, inspections, and competency requirements for operators.",
    },

    // CONSTRUCTION
    {
      title: "Construction Regulations, 2014",
      pdf: "https://www.gov.za/documents/occupational-health-and-safety-act-construction-regulations-7-feb-2014-0000",
      html: "https://www.gov.za/documents/occupational-health-and-safety-act-construction-regulations-7-feb-2014-0000",
      description:
        "Regulates construction work, safety files, fall protection, scaffolding, excavations, and contractor duties.",
    },
    {
      title: "Facilities Regulations",
      pdf: "https://www.gov.za/documents/occupational-health-and-safety-act-regulations-facilities",
      html: "https://www.gov.za/documents/occupational-health-and-safety-act-regulations-facilities",
      description:
        "Covers sanitation, change rooms, eating facilities, and hygiene requirements for workplaces and construction sites.",
    },

    // MINING
    {
      title: "Mine Health and Safety Act 29 of 1996 (MHSA)",
      pdf: "https://www.saflii.org/za/legis/consol_act/mhasa1996192.pdf",
      html: "https://www.gov.za/documents/mine-health-and-safety-act",
      description:
        "Primary legislation governing health and safety in the mining industry.",
    },
    {
      title: "Mine Health and Safety Regulations",
      pdf: "https://www.saflii.org/za/legis/consol_reg/mhasr301.pdf",
      html: "https://www.saflii.org/za/legis/consol_reg/mhasr301/",
      description:
        "Detailed regulations covering ventilation, explosives, machinery, TMMs, and underground safety.",
    },

    // ELECTRICAL
    {
      title: "Electrical Installation Regulations",
      pdf: "https://www.saflii.org/za/legis/consol_reg/eir342.pdf",
      html: "https://www.saflii.org/za/legis/consol_reg/eir342/",
      description:
        "Regulates electrical installations, certificates of compliance, and contractor responsibilities.",
    },
    {
      title: "Electrical Machinery Regulations",
      pdf: "https://www.saflii.org/za/legis/consol_reg/emr2011295.pdf",
      html: "https://www.saflii.org/za/legis/consol_reg/emr2011295/",
      description:
        "Covers electrical machinery safety, lockout procedures, and operator competency.",
    },

    // FIRE & HAZARDOUS SUBSTANCES
    {
      title: "Fire Brigade Services Act 99 of 1987",
      pdf: "https://www.gov.za/documents/fire-brigade-services-act-99-1987",
      html: "https://www.gov.za/documents/fire-brigade-services-act-99-1987",
      description:
        "Provides the legal framework for fire services, fire prevention, and emergency response.",
    },
    {
      title: "Hazardous Chemical Agents Regulations (HCA), 2021",
      pdf: "https://www.gov.za/documents/occupational-health-and-safety-act-hazardous-chemical-agents-regulations-2021-0",
      html: "https://www.gov.za/documents/occupational-health-and-safety-act-hazardous-chemical-agents-regulations-2021-0",
      description:
        "Regulates chemical exposure, SDS requirements, PPE, monitoring, and workplace chemical safety.",
    },
    {
      title: "Major Hazard Installation Regulations (MHI)",
      pdf: "https://www.saflii.org/za/legis/consol_reg/mhir368.pdf",
      html: "https://www.saflii.org/za/legis/consol_reg/mhir368/",
      description:
        "Applies to sites storing or handling large quantities of hazardous substances. Covers risk assessments and emergency planning.",
    },

    // ENVIRONMENTAL
    {
      title: "National Environmental Management Act (NEMA)",
      pdf: "https://www.gov.za/documents/national-environmental-management-act",
      html: "https://www.gov.za/documents/national-environmental-management-act",
      description:
        "Framework legislation for environmental protection, pollution control, and environmental impact assessments.",
    },
    {
      title: "National Water Act 36 of 1998",
      pdf: "https://www.gov.za/documents/national-water-act",
      html: "https://www.gov.za/documents/national-water-act",
      description:
        "Regulates water use, pollution prevention, and protection of water resources.",
    },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-green-200 to-blue-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Legal Registers</h1>
        <p className="text-black/70">
          South African Health & Safety legislation across general industry,
          construction, mining, electrical, fire, and environmental sectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((doc, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
            >
              <h2 className="text-xl font-bold text-black mb-2">{doc.title}</h2>
              <p className="text-black/70 text-sm mb-4">{doc.description}</p>

              <div className="flex gap-3">
                <a
                  href={doc.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Open PDF
                </a>

                <a
                  href={doc.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition"
                >
                  View Page
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

