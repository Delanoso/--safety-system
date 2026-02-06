// src/app/dashboard/appointments/templates/index.ts
import React from "react";

import HealthAndSafetyCommitteeChairmanTemplate from "./HealthAndSafetyCommitteeChairman";
import IncidentInvestigatorTemplate from "./IncidentInvestigator";
import LadderInspectorTemplate from "./LadderInspector";
import EarthLeakageInspectorTemplate from "./EarthLeakageInspector";
import PortableElectricalEquipmentInspectorTemplate from "./PortableElectricalEquipmentInspector";
import WorkPermitControllerTemplate from "./WorkPermitController";
import StackingSupervisorTemplate from "./StackingSupervisor";
import RackingSafetySupervisorTemplate from "./RackingSafetySupervisor";
import LiftingEquipmentInspectorTemplate from "./LiftingEquipmentInspector";
import HygieneControllerTemplate from "./HygieneController";
import HazardousChemicalSubstancesControllerTemplate from "./HazardousChemicalSubstancesController";
import HealthAndSafetyCoordinatorTemplate from "./HealthAndSafetyCoordinator";
import HealthAndSafetySupervisorTemplate from "./HealthAndSafetySupervisor";
import MotorTransportOfficerTemplate from "./MotorTransportOfficer";
import SecurityCoordinatorTemplate from "./SecurityCoordinator";
import HealthAndSafetyProgramAuditorTemplate from "./HealthAndSafetyProgramAuditor";
import LiftingMachineOperatorTemplate from "./LiftingMachineOperator";
import VesselsUnderPressureInspectorTemplate from "./VesselsUnderPressureInspector";
import GasWeldingAndCuttingEquipmentInspectorTemplate from "./GasWeldingAndCuttingEquipmentInspector";
import ScaffoldingErectorTemplate from "./ScaffoldingErector";
import ScaffoldingInspectorTemplate from "./ScaffoldingInspector";
import FallProtectionPlanDeveloperTemplate from "./FallProtectionPlanDeveloper";
import LiftingMachineInspectorTemplate from "./LiftingMachineInspector";
import FireEquipmentInspectorTemplate from "./FireEquipmentInspector";
import FireMarshallTemplate from "./FireMarshall";
import FirstAidMarshallTemplate from "./FirstAidMarshall";
import PollutionControllerTemplate from "./PollutionController";
import Section16_2_1_AssistantToCEOTemplate from "./Section16_2_1_AssistantToCEO";
import WorkplaceSection16_2_2_Template from "./WorkplaceSection16_2_2";
import HealthAndSafetyCommitteeMemberTemplate from "./HealthAndSafetyCommitteeMember";
import HealthAndSafetyRepresentativeTemplate from "./HealthAndSafetyRepresentative";
import AccreditedInstallationElectricianTemplate from "./AccreditedInstallationElectrician";
import FirstAiderTemplate from "./FirstAider";
import FireTeamMemberTemplate from "./FireTeamMember";
import FireAndEmergencyProtectionOfficerTemplate from "./FireAndEmergencyProtectionOfficer";
import Section16_1_ChiefExecutiveOfficerTemplate from "./Section16_1_ChiefExecutiveOfficer";

export interface AppointmentTemplateProps {
  appointee: string;
  appointer: string;
  department: string;
  date: string;
}

export type AppointmentTemplateKey =
  | "Incident Investigator"
  | "Ladder Inspector"
  | "Earth Leakage Inspector"
  | "Portable Electrical Equipment Inspector"
  | "Work Permit Controller"
  | "Stacking Supervisor"
  | "Racking Safety Supervisor"
  | "Lifting Equipment Inspector"
  | "Hygiene Controller"
  | "Hazardous Chemical Substances Controller"
  | "Health and Safety Coordinator"
  | "Health and Safety Supervisor"
  | "Motor Transport Officer"
  | "Security Coordinator"
  | "Health and Safety Program Auditor"
  | "Lifting Machine Operator"
  | "Vessels Under Pressure Inspector"
  | "Gas Welding and Cutting Equipment Inspector"
  | "Scaffolding Erector"
  | "Scaffolding Inspector"
  | "Fall Protection Plan Developer"
  | "Lifting Machine Inspector"
  | "Fire Equipment Inspector"
  | "Fire Marshall"
  | "First Aid Marshall"
  | "Pollution Controller"
  | "Section 16(2)(1) - Assistant to the Chief Executive Officer"
  | "Workplace Section 16(2)(2)"
  | "Health and Safety Committee Chairman"
  | "Health and Safety Committee Member"
  | "Health and Safety Representative"
  | "Accredited Installation Electrician"
  | "First Aider"
  | "Fire Team Member"
  | "Fire and Emergency Protection Officer"
  | "Section 16(1) Chief Executive Officer";

export interface AppointmentTemplateMeta {
  key: AppointmentTemplateKey;
  label: string;
  regulation: string;
  description: string;
  version: string;
  component: React.ComponentType<AppointmentTemplateProps>;
}

export const TEMPLATE_VERSION = "1.0.0";

const templates: Record<AppointmentTemplateKey, React.ComponentType<AppointmentTemplateProps>> = {
  "Incident Investigator": IncidentInvestigatorTemplate,
  "Ladder Inspector": LadderInspectorTemplate,
  "Earth Leakage Inspector": EarthLeakageInspectorTemplate,
  "Portable Electrical Equipment Inspector": PortableElectricalEquipmentInspectorTemplate,
  "Work Permit Controller": WorkPermitControllerTemplate,
  "Stacking Supervisor": StackingSupervisorTemplate,
  "Racking Safety Supervisor": RackingSafetySupervisorTemplate,
  "Lifting Equipment Inspector": LiftingEquipmentInspectorTemplate,
  "Hygiene Controller": HygieneControllerTemplate,
  "Hazardous Chemical Substances Controller": HazardousChemicalSubstancesControllerTemplate,
  "Health and Safety Coordinator": HealthAndSafetyCoordinatorTemplate,
  "Health and Safety Supervisor": HealthAndSafetySupervisorTemplate,
  "Motor Transport Officer": MotorTransportOfficerTemplate,
  "Security Coordinator": SecurityCoordinatorTemplate,
  "Health and Safety Program Auditor": HealthAndSafetyProgramAuditorTemplate,
  "Lifting Machine Operator": LiftingMachineOperatorTemplate,
  "Vessels Under Pressure Inspector": VesselsUnderPressureInspectorTemplate,
  "Gas Welding and Cutting Equipment Inspector": GasWeldingAndCuttingEquipmentInspectorTemplate,
  "Scaffolding Erector": ScaffoldingErectorTemplate,
  "Scaffolding Inspector": ScaffoldingInspectorTemplate,
  "Fall Protection Plan Developer": FallProtectionPlanDeveloperTemplate,
  "Lifting Machine Inspector": LiftingMachineInspectorTemplate,
  "Fire Equipment Inspector": FireEquipmentInspectorTemplate,
  "Fire Marshall": FireMarshallTemplate,
  "First Aid Marshall": FirstAidMarshallTemplate,
  "Pollution Controller": PollutionControllerTemplate,
  "Section 16(2)(1) - Assistant to the Chief Executive Officer": Section16_2_1_AssistantToCEOTemplate,
  "Workplace Section 16(2)(2)": WorkplaceSection16_2_2_Template,
  "Health and Safety Committee Chairman": HealthAndSafetyCommitteeChairmanTemplate,
  "Health and Safety Committee Member": HealthAndSafetyCommitteeMemberTemplate,
  "Health and Safety Representative": HealthAndSafetyRepresentativeTemplate,
  "Accredited Installation Electrician": AccreditedInstallationElectricianTemplate,
  "First Aider": FirstAiderTemplate,
  "Fire Team Member": FireTeamMemberTemplate,
  "Fire and Emergency Protection Officer": FireAndEmergencyProtectionOfficerTemplate,
  "Section 16(1) Chief Executive Officer": Section16_1_ChiefExecutiveOfficerTemplate,
};

export const templateRegistry: AppointmentTemplateMeta[] = [
  {
    key: "Incident Investigator",
    label: "Incident Investigator",
    regulation: "GAR 9 – Incident Reporting & Investigation",
    description: "Investigates incidents, identifies root causes, and recommends corrective actions.",
    version: TEMPLATE_VERSION,
    component: IncidentInvestigatorTemplate,
  },
  {
    key: "Ladder Inspector",
    label: "Ladder Inspector",
    regulation: "GSR 6 – Ladders",
    description: "Inspects ladders and ensures safe condition and use.",
    version: TEMPLATE_VERSION,
    component: LadderInspectorTemplate,
  },
  {
    key: "Earth Leakage Inspector",
    label: "Earth Leakage Inspector",
    regulation: "EIR & GMR 5",
    description: "Tests and maintains earth leakage devices for electrical safety.",
    version: TEMPLATE_VERSION,
    component: EarthLeakageInspectorTemplate,
  },
  {
    key: "Portable Electrical Equipment Inspector",
    label: "Portable Electrical Equipment Inspector",
    regulation: "Electrical Machinery Regs & SANS 10142‑1",
    description: "Inspects and tests portable electrical tools and appliances.",
    version: TEMPLATE_VERSION,
    component: PortableElectricalEquipmentInspectorTemplate,
  },
  {
    key: "Work Permit Controller",
    label: "Work Permit Controller",
    regulation: "GSR 2 & CR 8",
    description: "Controls permit‑to‑work for high‑risk activities.",
    version: TEMPLATE_VERSION,
    component: WorkPermitControllerTemplate,
  },
  {
    key: "Stacking Supervisor",
    label: "Stacking Supervisor",
    regulation: "GSR 8 – Stacking of Materials",
    description: "Supervises safe stacking and storage of materials.",
    version: TEMPLATE_VERSION,
    component: StackingSupervisorTemplate,
  },
  {
    key: "Racking Safety Supervisor",
    label: "Racking Safety Supervisor",
    regulation: "SANS 10263 & SANS 289",
    description: "Oversees racking safety, inspections, and load control.",
    version: TEMPLATE_VERSION,
    component: RackingSafetySupervisorTemplate,
  },
  {
    key: "Lifting Equipment Inspector",
    label: "Lifting Equipment Inspector",
    regulation: "DMR 18 – Lifting Tackle",
    description: "Inspects lifting tackle and related equipment.",
    version: TEMPLATE_VERSION,
    component: LiftingEquipmentInspectorTemplate,
  },
  {
    key: "Hygiene Controller",
    label: "Hygiene Controller",
    regulation: "Environmental Regs for Workplaces",
    description: "Monitors workplace hygiene and sanitary conditions.",
    version: TEMPLATE_VERSION,
    component: HygieneControllerTemplate,
  },
  {
    key: "Hazardous Chemical Substances Controller",
    label: "Hazardous Chemical Substances Controller",
    regulation: "HCS Regulations",
    description: "Controls hazardous chemical substances and compliance.",
    version: TEMPLATE_VERSION,
    component: HazardousChemicalSubstancesControllerTemplate,
  },
  {
    key: "Health and Safety Coordinator",
    label: "Health and Safety Coordinator",
    regulation: "CR 6 & GSR 2",
    description: "Coordinates health and safety activities and communication.",
    version: TEMPLATE_VERSION,
    component: HealthAndSafetyCoordinatorTemplate,
  },
  {
    key: "Health and Safety Supervisor",
    label: "Health and Safety Supervisor",
    regulation: "CR 8 & GSR 2",
    description: "Supervises work to ensure safe practices and compliance.",
    version: TEMPLATE_VERSION,
    component: HealthAndSafetySupervisorTemplate,
  },
  {
    key: "Motor Transport Officer",
    label: "Motor Transport Officer",
    regulation: "DMR 17 & Road Traffic Act",
    description: "Oversees vehicle safety, maintenance, and driver compliance.",
    version: TEMPLATE_VERSION,
    component: MotorTransportOfficerTemplate,
  },
  {
    key: "Security Coordinator",
    label: "Security Coordinator",
    regulation: "GSR 2 & internal security procedures",
    description: "Coordinates site security and incident response.",
    version: TEMPLATE_VERSION,
    component: SecurityCoordinatorTemplate,
  },
  {
    key: "Health and Safety Program Auditor",
    label: "Health and Safety Program Auditor",
    regulation: "GAR 9 & ISO 45001 alignment",
    description: "Audits the health and safety management system.",
    version: TEMPLATE_VERSION,
    component: HealthAndSafetyProgramAuditorTemplate,
  },
  {
    key: "Lifting Machine Operator",
    label: "Lifting Machine Operator",
    regulation: "DMR 18(11)",
    description: "Operates lifting machines safely and within limits.",
    version: TEMPLATE_VERSION,
    component: LiftingMachineOperatorTemplate,
  },
  {
    key: "Vessels Under Pressure Inspector",
    label: "Vessels Under Pressure Inspector",
    regulation: "PER & SANS 347",
    description: "Inspects pressure vessels and related equipment.",
    version: TEMPLATE_VERSION,
    component: VesselsUnderPressureInspectorTemplate,
  },
  {
    key: "Gas Welding and Cutting Equipment Inspector",
    label: "Gas Welding and Cutting Equipment Inspector",
    regulation: "GSR 9 & SANS 10238",
    description: "Inspects gas welding and cutting equipment.",
    version: TEMPLATE_VERSION,
    component: GasWeldingAndCuttingEquipmentInspectorTemplate,
  },
  {
    key: "Scaffolding Erector",
    label: "Scaffolding Erector",
    regulation: "CR 16",
    description: "Erects scaffolding according to legal and manufacturer specs.",
    version: TEMPLATE_VERSION,
    component: ScaffoldingErectorTemplate,
  },
  {
    key: "Scaffolding Inspector",
    label: "Scaffolding Inspector",
    regulation: "CR 16(1)(e)",
    description: "Inspects scaffolding before use and weekly.",
    version: TEMPLATE_VERSION,
    component: ScaffoldingInspectorTemplate,
  },
  {
    key: "Fall Protection Plan Developer",
    label: "Fall Protection Plan Developer",
    regulation: "CR 10",
    description: "Develops and maintains the Fall Protection Plan.",
    version: TEMPLATE_VERSION,
    component: FallProtectionPlanDeveloperTemplate,
  },
  {
    key: "Lifting Machine Inspector",
    label: "Lifting Machine Inspector",
    regulation: "DMR 18 & LMI registration",
    description: "Inspects and certifies lifting machines.",
    version: TEMPLATE_VERSION,
    component: LiftingMachineInspectorTemplate,
  },
  {
    key: "Fire Equipment Inspector",
    label: "Fire Equipment Inspector",
    regulation: "GSR 3 & SANS 1475",
    description: "Inspects and maintains fire equipment.",
    version: TEMPLATE_VERSION,
    component: FireEquipmentInspectorTemplate,
  },
  {
    key: "Fire Marshall",
    label: "Fire Marshall",
    regulation: "GSR 3 & emergency plan",
    description: "Supports fire prevention and evacuation.",
    version: TEMPLATE_VERSION,
    component: FireMarshallTemplate,
  },
  {
    key: "First Aid Marshall",
    label: "First Aid Marshall",
    regulation: "GSR 3",
    description: "Supports first aid and emergency response.",
    version: TEMPLATE_VERSION,
    component: FirstAidMarshallTemplate,
  },
  {
    key: "Pollution Controller",
    label: "Pollution Controller",
    regulation: "Environmental Regs & NEMA",
    description: "Controls pollution and environmental risks.",
    version: TEMPLATE_VERSION,
    component: PollutionControllerTemplate,
  },
  {
    key: "Section 16(2)(1) - Assistant to the Chief Executive Officer",
    label: "Section 16(2)(1) – Assistant to CEO",
    regulation: "OHS Act Section 16(2)",
    description: "Assists the CEO in fulfilling OHS duties.",
    version: TEMPLATE_VERSION,
    component: Section16_2_1_AssistantToCEOTemplate,
  },
  {
    key: "Workplace Section 16(2)(2)",
    label: "Workplace Section 16(2)(2)",
    regulation: "OHS Act Section 16(2)",
    description: "Assists with workplace‑level OHS compliance.",
    version: TEMPLATE_VERSION,
    component: WorkplaceSection16_2_2_Template,
  },
  {
    key: "Health and Safety Committee Chairman",
    label: "Health and Safety Committee Chairman",
    regulation: "OHS Act Sections 19 & 20",
    description: "Chairs the Health and Safety Committee.",
    version: TEMPLATE_VERSION,
    component: HealthAndSafetyCommitteeChairmanTemplate,
  },
  {
    key: "Health and Safety Committee Member",
    label: "Health and Safety Committee Member",
    regulation: "OHS Act Sections 19 & 20",
    description: "Participates in the Health and Safety Committee.",
    version: TEMPLATE_VERSION,
    component: HealthAndSafetyCommitteeMemberTemplate,
  },
  {
    key: "Health and Safety Representative",
    label: "Health and Safety Representative",
    regulation: "OHS Act Sections 17 & 18",
    description: "Represents employees on health and safety matters.",
    version: TEMPLATE_VERSION,
    component: HealthAndSafetyRepresentativeTemplate,
  },
  {
    key: "Accredited Installation Electrician",
    label: "Accredited Installation Electrician",
    regulation: "Electrical Installation Regulations",
    description: "Performs and certifies electrical installations.",
    version: TEMPLATE_VERSION,
    component: AccreditedInstallationElectricianTemplate,
  },
  {
    key: "First Aider",
    label: "First Aider",
    regulation: "GSR 3",
    description: "Provides first aid treatment and maintains first aid boxes.",
    version: TEMPLATE_VERSION,
    component: FirstAiderTemplate,
  },
  {
    key: "Fire Team Member",
    label: "Fire Team Member",
    regulation: "GSR 3 & emergency plan",
    description: "Supports fire response and evacuation.",
    version: TEMPLATE_VERSION,
    component: FireTeamMemberTemplate,
  },
  {
    key: "Fire and Emergency Protection Officer",
    label: "Fire and Emergency Protection Officer",
    regulation: "GSR 3 & emergency plan",
    description: "Leads fire and emergency preparedness.",
    version: TEMPLATE_VERSION,
    component: FireAndEmergencyProtectionOfficerTemplate,
  },
  {
    key: "Section 16(1) Chief Executive Officer",
    label: "Section 16(1) Chief Executive Officer",
    regulation: "OHS Act Section 16(1)",
    description: "Holds overall legal responsibility for OHS compliance.",
    version: TEMPLATE_VERSION,
    component: Section16_1_ChiefExecutiveOfficerTemplate,
  },
];

export function searchTemplates(query: string): AppointmentTemplateMeta[] {
  const q = query.toLowerCase().trim();
  if (!q) return templateRegistry;
  return templateRegistry.filter(
    (t) =>
      t.label.toLowerCase().includes(q) ||
      t.regulation.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  );
}

export default templates;

