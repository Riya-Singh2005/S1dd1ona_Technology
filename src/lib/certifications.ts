export interface IsoCertification {
  id: string;
  standard: string;
  title: string;
  acronym: string;
}

export const ISO_CERTIFICATIONS: readonly IsoCertification[] = [
  { id: "iso-27001", standard: "ISO 27001:2022", title: "Information Security Management System", acronym: "ISMS" },
  { id: "iso-20000-1", standard: "ISO 20000-1:2018", title: "IT Service Management System", acronym: "ITSMS" },
  { id: "iso-45001", standard: "ISO 45001:2018", title: "Occupational Health & Safety Management System", acronym: "OHSMS" },
  { id: "iso-9001", standard: "ISO 9001:2015", title: "Quality Management System", acronym: "QMS" },
] as const;
