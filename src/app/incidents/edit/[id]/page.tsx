"use client";

import { use } from "react";
import IncidentFormPage from "@/components/incident/IncidentFormPage";

export default function EditIncidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <IncidentFormPage editId={id} />;
}
