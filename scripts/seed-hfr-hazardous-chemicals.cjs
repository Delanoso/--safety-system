const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const LOCATION = "Boksburg Depot";

const CHEMICALS = [
  { name: "Acetone", hazardClass: "Flammable", location: "Chemical store", notes: "Used in workshop and paint preparation. SDS to be uploaded." },
  { name: "Alubrite", hazardClass: "Corrosive / Cleaning agent", location: "Workshop", notes: "Aluminium cleaning product. SDS to be uploaded." },
  { name: "Anker", hazardClass: "Adhesive", location: "Workshop", notes: "Anchoring / fixing compound. SDS to be uploaded." },
  { name: "Bleach", hazardClass: "Corrosive / Oxidising", location: "Cleaning store", notes: "Sodium hypochlorite based cleaner. SDS to be uploaded." },
  { name: "Body Filler", hazardClass: "Irritant", location: "Body shop", notes: "Polyester body filler for truck and trailer repairs. SDS to be uploaded." },
  { name: "Diesel", hazardClass: "Flammable", location: "Diesel bay / bulk storage", notes: "Fuel for truck fleet. SDS to be uploaded." },
  { name: "Doom", hazardClass: "Pesticide / Toxic", location: "Cleaning store", notes: "Insecticide. Restricted use — trained personnel only. SDS to be uploaded." },
  { name: "Electrical Cleaner", hazardClass: "Flammable", location: "Workshop", notes: "Solvent-based electrical contact cleaner. SDS to be uploaded." },
  { name: "Ethanol", hazardClass: "Flammable", location: "Chemical store", notes: "Industrial ethanol. SDS to be uploaded." },
  { name: "G3 Compound", hazardClass: "Abrasive / Irritant", location: "Body shop", notes: "Cutting and polishing compound. SDS to be uploaded." },
  { name: "Mobil Delvac MX", hazardClass: "Petroleum product", location: "Workshop / lube store", notes: "Heavy-duty diesel engine oil. SDS to be uploaded." },
  { name: "Motor Oil", hazardClass: "Petroleum product", location: "Workshop / lube store", notes: "Engine and gearbox oils. SDS to be uploaded." },
  { name: "MPS Tyre Shine", hazardClass: "Flammable", location: "Workshop", notes: "Tyre dressing product. SDS to be uploaded." },
  { name: "Paint Stripper", hazardClass: "Flammable / Corrosive", location: "Body shop", notes: "Solvent paint remover. Use in ventilated area. SDS to be uploaded." },
  { name: "Pine gel", hazardClass: "Irritant", location: "Cleaning store", notes: "Pine gel cleaner / degreaser. SDS to be uploaded." },
  { name: "Q20", hazardClass: "Flammable / Aerosol", location: "Workshop", notes: "Multi-purpose lubricant aerosol. SDS to be uploaded." },
  { name: "Q-Bond", hazardClass: "Adhesive / Flammable", location: "Workshop", notes: "Instant adhesive. SDS to be uploaded." },
  { name: "Red Degreaser", hazardClass: "Corrosive / Flammable", location: "Workshop", notes: "Engine and parts degreaser. SDS to be uploaded." },
  { name: "Resin Solution", hazardClass: "Flammable", location: "Body shop", notes: "Fibreglass resin solution. SDS to be uploaded." },
  { name: "Solvent Paints", hazardClass: "Flammable", location: "Paint store", notes: "Solvent-based paints for vehicles. SDS to be uploaded." },
  { name: "Sunlight Liquid", hazardClass: "Irritant", location: "Cleaning store", notes: "Dishwashing / cleaning liquid. SDS to be uploaded." },
  { name: "Tar Remover", hazardClass: "Flammable", location: "Workshop", notes: "Tar and bitumen remover for truck bodies. SDS to be uploaded." },
  { name: "Thinners", hazardClass: "Flammable", location: "Paint store", notes: "Paint thinners and reducers. SDS to be uploaded." },
];

async function main() {
  const company = await prisma.company.findFirst({
    where: {
      OR: [
        { name: { contains: "HFR Schaefer", mode: "insensitive" } },
        { name: { contains: "HFR", mode: "insensitive" } },
      ],
    },
  });

  if (!company) {
    console.error("Company not found");
    process.exit(1);
  }

  const created = [];
  const skipped = [];

  for (const chem of CHEMICALS) {
    const existing = await prisma.hazardousChemical.findFirst({
      where: {
        companyId: company.id,
        name: { equals: chem.name, mode: "insensitive" },
      },
    });

    if (existing) {
      skipped.push({ name: chem.name, id: existing.id });
      continue;
    }

    const record = await prisma.hazardousChemical.create({
      data: {
        name: chem.name,
        location: chem.location || LOCATION,
        hazardClass: chem.hazardClass || null,
        notes: chem.notes || null,
        companyId: company.id,
      },
    });

    created.push({ id: record.id, name: record.name });
  }

  console.log(
    JSON.stringify({
      status: "done",
      company: company.name,
      created,
      skipped,
    })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
