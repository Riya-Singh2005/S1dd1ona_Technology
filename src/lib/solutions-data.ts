export interface SolutionCapability {
  title: string;
  description: string;
}

export interface SolutionDeliveryStage {
  title: string;
  description: string;
}

export interface SolutionValue {
  title: string;
  description: string;
}

export interface SolutionTechnicalConsideration {
  label: string;
  detail: string;
}

export interface SolutionComparisonItem {
  title: string;
  description: string;
  emphasis?: boolean;
}

export interface SolutionFaq {
  question: string;
  answer: string;
}

export interface SolutionExperienceItem {
  slug: string;
  number: string;
  title: string;
  category: string;
  audience: string;
  proposition: string;
  summary: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  heroVisual?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    tone?: "cool" | "warm";
    treatment?: "cutout" | "scene";
  };
  overview: {
    problem: string;
    approach: string;
    outcome: string;
  };
  capabilities: SolutionCapability[];
  delivery: SolutionDeliveryStage[];
  value: SolutionValue[];
  useCases: string[];
  technicalConsiderations: SolutionTechnicalConsideration[];
  comparison?: SolutionComparisonItem[];
  /** Search-result title. `title` remains the on-page heading and nav label. */
  seoTitle: string;
  faqs: SolutionFaq[];
  /** Paths of closely related services and solutions, linked from the page. */
  related: string[];
}

export const SOLUTIONS: SolutionExperienceItem[] = [
  {
    slug: "backup-disaster-recovery",
    number: "01",
    title: "Backup & Disaster Recovery",
    category: "Data resilience and continuity",
    audience: "For IT and operations leaders responsible for business-critical workloads across on-premises, cloud, and hybrid environments.",
    proposition: "Build recovery into the way your systems are operated.",
    summary: "A practical recovery framework that aligns backup design, operational ownership, and testing with the workloads your business depends on.",
    metaDescription: "Backup and disaster recovery from Siddiona Technologies, New Delhi: recovery planning, backup architecture, hybrid workload protection and recovery testing.",
    image: "/images/capabilities/cloud-solutions.jpg",
    imageAlt: "Technology operations team monitoring cloud and infrastructure systems",
    imagePosition: "center",
    heroVisual: {
      src: "/images/solutions/backup-disaster-recovery-cloud.png",
      alt: "Three-dimensional cloud and connected data network representing protected digital infrastructure",
      width: 1448,
      height: 1086,
      tone: "cool",
      treatment: "cutout",
    },
    overview: {
      problem: "Backups often grow one system at a time, leaving inconsistent retention, unclear dependencies, and recovery procedures that have not been exercised.",
      approach: "We assess workload criticality, data flows, platform constraints, and recovery objectives before shaping a documented architecture and operating model.",
      outcome: "Teams gain a more coherent, testable recovery capability with clear policies, ownership, evidence, and priorities for improvement.",
    },
    capabilities: [
      { title: "Recovery assessment", description: "Map critical workloads, dependencies, current backup coverage, recovery practices, and operational ownership." },
      { title: "Architecture and policy design", description: "Define backup tiers, retention, copy placement, isolation, access controls, and recovery sequencing." },
      { title: "Hybrid workload protection", description: "Coordinate protection for virtual machines, databases, applications, endpoints, and cloud-hosted workloads." },
      { title: "Implementation and transition", description: "Configure the selected design, document operating procedures, and prepare administrators for day-to-day control." },
      { title: "Recovery testing", description: "Exercise agreed recovery scenarios, record evidence, identify gaps, and feed findings into the next operating cycle." },
    ],
    delivery: [
      { title: "Assess", description: "Establish workload criticality, dependencies, existing controls, and assessed recovery objectives." },
      { title: "Design", description: "Translate priorities into protection tiers, retention, isolation, recovery order, and ownership." },
      { title: "Implement", description: "Configure protection, monitoring, documentation, and administrative access across the agreed scope." },
      { title: "Test", description: "Run controlled recovery exercises and document results against agreed acceptance criteria." },
      { title: "Operate", description: "Review jobs, capacity, exceptions, test evidence, and changing business requirements as an operating rhythm." },
    ],
    value: [
      { title: "Clearer priorities", description: "Recovery effort is aligned to workload importance instead of applying one policy everywhere." },
      { title: "Consistent controls", description: "Retention, isolation, access, monitoring, and escalation are easier to govern across platforms." },
      { title: "Test evidence", description: "Recovery assumptions are examined through planned exercises and documented findings." },
      { title: "Operational visibility", description: "Teams can see ownership, exceptions, capacity pressures, and the work required to improve readiness." },
    ],
    useCases: ["Hybrid infrastructure estates", "Virtualized server platforms", "Database and line-of-business applications", "Distributed or branch operations", "Cloud-hosted business workloads", "Recovery programme modernization"],
    technicalConsiderations: [
      { label: "Recovery objectives", detail: "RPO and RTO are assessed business objectives shaped by workload needs, architecture, cost, and testing; they are not presented as universal guarantees." },
      { label: "Isolation", detail: "Copy separation, immutability options, administrative boundaries, encryption, and access controls should be evaluated together." },
      { label: "Dependencies", detail: "Applications must be recovered in a workable order across identity, network, data, middleware, and application layers." },
      { label: "Evidence", detail: "Job success alone is not proof of recoverability. Test scope, results, exceptions, and remediation should be recorded." },
    ],
    seoTitle: "Backup & Disaster Recovery Solutions",
    faqs: [
      {
        question: "What is the difference between backup and disaster recovery?",
        answer: "Backup keeps copies of data so it can be restored. Disaster recovery is the wider capability to bring systems and services back in a workable order after a major failure, including infrastructure, identity, networks and applications, not just data.",
      },
      {
        question: "What are RPO and RTO?",
        answer: "Recovery Point Objective (RPO) is how much data loss, measured in time, a workload can tolerate. Recovery Time Objective (RTO) is how long it can be unavailable. We assess both per workload with you, as business objectives shaped by architecture and cost rather than universal guarantees.",
      },
      {
        question: "Can you protect both on-premise and cloud workloads?",
        answer: "Yes. Hybrid workload protection brings virtual machines, databases, applications, endpoints and cloud-hosted workloads under one set of policies for retention, isolation and access.",
      },
      {
        question: "How do we know recovery will actually work?",
        answer: "By testing it. We run controlled recovery exercises against agreed scenarios, record the evidence and gaps, and feed the findings into the next operating cycle. A successful backup job on its own is not proof of recoverability.",
      },
      {
        question: "How do you protect backups from ransomware?",
        answer: "Copy separation, immutability options, separate administrative boundaries, encryption and access controls are evaluated together during architecture design, so a compromise of production systems does not automatically reach the backups.",
      },
    ],
    related: ["/services/cloud-solutions", "/services/managed-it-services", "/solutions/data-center-migration-virtualization"],
  },
  {
    slug: "data-center-migration-virtualization",
    number: "02",
    title: "Data Center Migration & Virtualization",
    category: "Infrastructure transformation",
    audience: "For technology teams planning workload consolidation, platform refresh, facility moves, or hybrid infrastructure transitions.",
    proposition: "Move critical workloads with the dependencies understood before cutover.",
    summary: "A dependency-led migration and virtualization approach that connects discovery, design, wave planning, cutover, validation, and operational handover.",
    metaDescription: "Data center migration and virtualization from Siddiona Technologies: dependency mapping, platform design, migration waves, cutover, validation and handover.",
    image: "/images/capabilities/managed-it.jpg",
    imageAlt: "Engineers working alongside enterprise server infrastructure",
    imagePosition: "center",
    heroVisual: {
      src: "/images/solutions/data-center-cloud-infrastructure.png",
      alt: "Cloud and server infrastructure representing a virtualized data center",
      width: 551,
      height: 492,
    },
    overview: {
      problem: "Infrastructure moves become risky when application dependencies, capacity constraints, compatibility, and ownership are discovered during the cutover window.",
      approach: "We build a fact base, group workloads into migration waves, design the target platform, and define validation and rollback criteria before execution.",
      outcome: "The programme becomes easier to sequence, govern, validate, and hand over to the team that will operate the new environment.",
    },
    capabilities: [
      { title: "Discovery and dependency mapping", description: "Inventory workloads, platforms, network relationships, data flows, owners, and business constraints." },
      { title: "Target platform design", description: "Shape compute, virtualization, storage, network, security, resilience, and management requirements." },
      { title: "Migration wave planning", description: "Group workloads by dependency, complexity, downtime tolerance, validation needs, and rollback approach." },
      { title: "Migration and cutover", description: "Coordinate data movement, workload transition, change controls, communications, and agreed checkpoints." },
      { title: "Validation and handover", description: "Verify technical and application outcomes, close exceptions, and transfer documentation to operations." },
    ],
    delivery: [
      { title: "Assess", description: "Establish the current estate, business priorities, constraints, and programme risks." },
      { title: "Plan", description: "Define scope, migration waves, decision gates, communications, rollback, and acceptance criteria." },
      { title: "Design", description: "Create the target architecture and the detailed transition design for each workload group." },
      { title: "Migrate", description: "Execute controlled migration waves with change governance and clear technical ownership." },
      { title: "Validate", description: "Confirm infrastructure, application, connectivity, performance, and operational acceptance." },
      { title: "Optimize", description: "Resolve post-migration findings, right-size resources, and embed the target operating procedures." },
    ],
    value: [
      { title: "Dependency visibility", description: "Teams plan around how applications actually connect, reducing late discovery during execution." },
      { title: "Controlled sequencing", description: "Wave plans and decision gates make complex transitions easier to govern and communicate." },
      { title: "Platform fit", description: "Capacity and compatibility are considered before target resources are committed." },
      { title: "Documented handover", description: "Operations receives tested configurations, known exceptions, and clearer ownership." },
    ],
    useCases: ["Data center relocation", "Server and platform refresh", "Virtualization consolidation", "Private or hybrid cloud transition", "Storage and network modernization", "Workload exit from legacy infrastructure"],
    technicalConsiderations: [
      { label: "Application dependencies", detail: "Identity, DNS, network, data, middleware, integrations, and scheduled processes need to be understood as a system." },
      { label: "Compatibility", detail: "Operating systems, hypervisors, hardware, licensing, support status, and application constraints shape the migration path." },
      { label: "Data movement", detail: "Volume, change rate, available bandwidth, synchronization, and integrity checks affect sequencing and cutover duration." },
      { label: "Rollback and acceptance", detail: "Each wave needs explicit decision points, rollback conditions, validation owners, and evidence of acceptance." },
    ],
    seoTitle: "Data Center Migration & Virtualization Services",
    faqs: [
      {
        question: "How do you plan a data center migration?",
        answer: "We build a fact base first: an inventory of workloads, platforms, network relationships, data flows and owners. Workloads are then grouped into migration waves by dependency, complexity and downtime tolerance, each with its own validation and rollback criteria.",
      },
      {
        question: "What is server virtualization, and why do it?",
        answer: "Virtualization runs several workloads as virtual machines on shared physical hardware. Consolidating onto a virtualized platform can reduce the number of physical servers to maintain and makes workloads easier to move, back up and recover.",
      },
      {
        question: "Can workloads move to the cloud as part of the migration?",
        answer: "Yes. Private and hybrid cloud transitions are a common destination, and target platform design considers which workloads suit on-premise virtualization and which suit the cloud.",
      },
      {
        question: "How is downtime managed during cutover?",
        answer: "Each migration wave has agreed change windows, checkpoints, communications and explicit rollback conditions. Data volume, change rate and bandwidth are assessed in advance, so cutover duration is planned rather than guessed.",
      },
      {
        question: "What do we receive at the end?",
        answer: "Validated infrastructure and application outcomes, closed or documented exceptions, and handover documentation for the team that will operate the new environment, followed by post-migration optimisation.",
      },
    ],
    related: ["/services/enterprise-solutions", "/services/cloud-solutions", "/services/it-consultancy-services"],
  },
  {
    slug: "smart-classrooms-av-systems",
    number: "03",
    title: "Smart Classrooms & AV Systems",
    category: "Learning and collaboration environments",
    audience: "For schools, universities, training centres, and organisations creating consistent in-room and hybrid learning experiences.",
    proposition: "Make classroom technology work as one teachable, supportable room system.",
    summary: "Integrated learning environments that connect visual, audio, control, collaboration, and network elements around how teachers and participants use the room.",
    metaDescription: "Smart classroom and AV system integration from Siddiona Technologies: interactive displays, room audio, hybrid learning, control, commissioning and training.",
    image: "/images/capabilities/cloud-infrastructure.jpg",
    imageAlt: "A collaborative team using shared digital content in a meeting environment",
    imagePosition: "center",
    heroVisual: {
      src: "/images/solutions/smart-classroom-av-hero.png",
      alt: "Technology-enabled classroom with interactive display, connected desks, and a humanoid robot",
      width: 626,
      height: 313,
      tone: "cool",
      treatment: "scene",
    },
    overview: {
      problem: "Room technology can be difficult to teach with and support when displays, audio, collaboration tools, controls, and connectivity are selected in isolation.",
      approach: "We begin with room use, sightlines, acoustics, teaching workflows, platform needs, and support constraints, then integrate the system as a whole.",
      outcome: "Educators and support teams receive a more consistent room experience with documented controls, commissioning results, and practical enablement.",
    },
    capabilities: [
      { title: "Room and experience design", description: "Translate teaching modes, room geometry, audience size, accessibility, and support needs into a system brief." },
      { title: "Visual and presentation systems", description: "Integrate interactive displays, projectors, content sources, switching, distribution, and wireless presentation." },
      { title: "Audio and voice", description: "Plan microphones, loudspeakers, processing, and room-specific tuning for intelligible local and remote participation." },
      { title: "Collaboration and control", description: "Connect conferencing, room controls, cameras, content sharing, and approved institutional platforms." },
      { title: "Commissioning and enablement", description: "Test signal paths and room scenarios, document the installation, and prepare users and support teams." },
    ],
    delivery: [
      { title: "Survey", description: "Review teaching workflows, room geometry, acoustics, lighting, services, connectivity, and constraints." },
      { title: "Design", description: "Develop the room topology, equipment schedule, control approach, drawings, and acceptance scenarios." },
      { title: "Integrate", description: "Install, configure, connect, and label the agreed AV, collaboration, network, and control components." },
      { title: "Commission", description: "Test signal paths, audio, display, controls, conferencing, fail states, and user scenarios." },
      { title: "Enable", description: "Provide operating guidance, support documentation, and practical orientation for room users and administrators." },
    ],
    value: [
      { title: "Consistent rooms", description: "Common interaction patterns reduce unnecessary variation across teaching and training spaces." },
      { title: "Simpler operation", description: "Controls and source selection are designed around real room workflows instead of equipment boundaries." },
      { title: "Clearer communication", description: "Sightlines, voice pickup, reproduction, and remote participation are considered as connected experience factors." },
      { title: "Maintainable systems", description: "Labelling, documentation, service access, and support ownership are addressed during design." },
    ],
    useCases: ["Higher-education lecture rooms", "School classrooms and labs", "Corporate training centres", "Hybrid learning spaces", "Multipurpose teaching rooms", "Faculty collaboration and content rooms"],
    technicalConsiderations: [
      { label: "Room conditions", detail: "Sightlines, ambient light, acoustics, background noise, mounting, heat, and service access influence equipment and layout choices." },
      { label: "Connectivity", detail: "Power, structured cabling, network capacity, wireless conditions, segmentation, and approved endpoints should be planned together." },
      { label: "Platform fit", detail: "Collaboration, identity, content, device management, and recording requirements need compatibility validation." },
      { label: "Accessibility and support", detail: "Controls, captions, assisted listening needs, user guidance, spares, and escalation paths should be included in the operating design." },
    ],
    seoTitle: "Smart Classroom & AV System Integration",
    faqs: [
      {
        question: "What is included in a smart classroom?",
        answer: "Typically an interactive display or projection system, content sources and wireless presentation, microphones and loudspeakers tuned to the room, cameras and conferencing for remote participants, and a simple control system. The exact mix is designed around how the room is used for teaching.",
      },
      {
        question: "Do you design for hybrid learning?",
        answer: "Yes. Audio pickup, cameras and conferencing are planned so remote participants can see and hear clearly, and the collaboration platform is validated against your institution's approved tools.",
      },
      {
        question: "Can you upgrade existing classrooms rather than start from scratch?",
        answer: "We begin with a survey of each room, covering teaching workflows, geometry, acoustics, lighting, power and connectivity. Suitable existing equipment can be reused where it fits the integrated design.",
      },
      {
        question: "Is this only for schools and universities?",
        answer: "No. The same approach applies to corporate training centres, multipurpose teaching rooms and faculty collaboration spaces.",
      },
      {
        question: "Do you train staff to use the rooms?",
        answer: "Enablement is a delivery stage in its own right: operating guidance, support documentation and practical orientation for teachers, room users and the administrators who look after the systems.",
      },
    ],
    related: ["/services/enterprise-solutions", "/solutions/annual-maintenance-contract-services", "/services/managed-it-services"],
  },
  {
    slug: "annual-maintenance-contract-services",
    number: "04",
    title: "Annual Maintenance Contract Services",
    category: "Infrastructure maintenance and lifecycle",
    audience: "For organisations that need a documented maintenance rhythm across infrastructure, workplace technology, and agreed support scope.",
    proposition: "Turn maintenance from isolated fixes into a documented operating rhythm.",
    summary: "A structured annual maintenance model that connects asset baselines, preventive activity, response coordination, reporting, and lifecycle planning.",
    metaDescription: "IT annual maintenance contract (AMC) services from Siddiona Technologies, New Delhi: asset baselines, preventive maintenance, issue response and reporting.",
    image: "/images/capabilities/enterprise-solutions.jpg",
    imageAlt: "Infrastructure operations professionals reviewing systems and technical status",
    imagePosition: "center",
    heroVisual: {
      src: "/images/solutions/amc-maintenance-gears.png",
      alt: "Two figures coordinating three mechanical gears to represent planned maintenance",
      width: 1448,
      height: 1086,
      tone: "warm",
    },
    overview: {
      problem: "When maintenance is driven only by individual failures, asset records, recurring risks, service history, and lifecycle decisions become difficult to manage.",
      approach: "We establish the agreed asset and service baseline, define planned activities and escalation paths, then review work and findings through a regular reporting cycle.",
      outcome: "Technology teams gain clearer records, maintenance priorities, response coordination, and evidence for repair, replacement, and budget decisions.",
    },
    capabilities: [
      { title: "Asset and configuration baseline", description: "Record the agreed equipment scope, ownership, condition, dependencies, warranty context, and configuration references." },
      { title: "Preventive maintenance planning", description: "Schedule checks, housekeeping, firmware or configuration reviews where appropriate, and documented follow-up actions." },
      { title: "Issue response coordination", description: "Apply agreed intake, triage, escalation, communication, and closure procedures within the contracted scope." },
      { title: "Vendor and lifecycle coordination", description: "Track warranty, support, licensing, spares, vendor dependencies, and items approaching renewal or replacement." },
      { title: "Service reporting", description: "Maintain service history, open findings, recurring issues, completed work, and recommendations for the next review period." },
    ],
    delivery: [
      { title: "Baseline", description: "Confirm assets, configurations, dependencies, condition, responsibilities, and contractual boundaries." },
      { title: "Plan", description: "Agree maintenance activities, calendars, access, escalation routes, evidence, and reporting cadence." },
      { title: "Maintain", description: "Complete planned work, record findings, and raise corrective or lifecycle actions for agreement." },
      { title: "Respond", description: "Coordinate reported issues through the defined triage, communication, escalation, and closure process." },
      { title: "Review", description: "Examine service history, repeat issues, asset health, open risks, and priorities for the next cycle." },
    ],
    value: [
      { title: "Asset visibility", description: "Teams work from an agreed scope and stronger service history rather than isolated support records." },
      { title: "Planned attention", description: "Preventive activities create opportunities to identify issues before they become avoidable disruption." },
      { title: "Clearer accountability", description: "Intake, ownership, escalation, documentation, and closure expectations are defined for the contracted scope." },
      { title: "Lifecycle decisions", description: "Maintenance evidence supports repair, renewal, replacement, spares, and budget conversations." },
    ],
    useCases: ["Enterprise server and network estates", "Campus and branch infrastructure", "Workplace and collaboration technology", "Data center support environments", "Multi-site technology operations", "Post-project operational support"],
    technicalConsiderations: [
      { label: "Contract scope", detail: "Covered assets, locations, activities, service windows, exclusions, dependencies, and responsibilities must be explicit." },
      { label: "Response model", detail: "Coverage hours, priority definitions, escalation paths, access arrangements, and target handling are agreed per contract rather than assumed." },
      { label: "Spares and vendors", detail: "Part availability, warranty status, vendor support, licenses, and end-of-support conditions affect repair options and timing." },
      { label: "Change and evidence", detail: "Maintenance windows, approvals, configuration records, service notes, test results, and acceptance should remain traceable." },
    ],
    comparison: [
      { title: "Reactive support", description: "Begins after a fault is reported and focuses on restoring the affected service within the agreed support scope." },
      { title: "Preventive maintenance", description: "Uses planned inspections and upkeep to identify condition, configuration, capacity, or lifecycle concerns." },
      { title: "Structured annual maintenance", description: "Connects the asset baseline, preventive plan, issue response, reporting, and lifecycle review in one operating cycle.", emphasis: true },
    ],
    seoTitle: "IT Annual Maintenance Contract (AMC) Services",
    faqs: [
      {
        question: "What is an IT AMC?",
        answer: "An annual maintenance contract is a yearly agreement covering planned maintenance and issue response for a defined set of IT equipment and systems, such as servers, networks and workplace technology, with agreed coverage, escalation and reporting.",
      },
      {
        question: "What equipment can an AMC cover?",
        answer: "Scope is agreed per contract. It commonly includes server and network estates, campus and branch infrastructure, workplace and collaboration technology, and data center support environments, across one or several sites.",
      },
      {
        question: "How are response times agreed?",
        answer: "Coverage hours, priority definitions, escalation paths, access arrangements and target handling are agreed per contract rather than assumed, and recorded in the contract scope.",
      },
      {
        question: "What reports do we receive?",
        answer: "Service history, completed preventive work, open findings, recurring issues and recommendations for the next period, reviewed with you on an agreed cadence. That record also supports repair, replacement and budget decisions.",
      },
      {
        question: "Do you handle warranty and vendor coordination?",
        answer: "Vendor and lifecycle coordination tracks warranty, support, licensing, spares and vendor dependencies, and flags items approaching renewal or end of support.",
      },
    ],
    related: ["/services/managed-it-services", "/services/enterprise-solutions", "/solutions/backup-disaster-recovery"],
  },
];

export function getSolution(slug: string): SolutionExperienceItem | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}
