export interface ServiceCapability {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageFit?: "cover" | "contain";
  imageBackground?: string;
}

export interface ServiceDeliveryStage {
  step: string;
  title: string;
  tag: string;
  description: string;
}

export interface ServiceHeroMetric {
  label: string;
  value: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceExperienceItem {
  slug: string;
  serviceNumber: string;
  title: string;
  shortTitle: string;
  label: string;
  headline: string;
  description: string;
  introduction: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  accent: string;
  heroMetrics: readonly ServiceHeroMetric[];
  capabilities: readonly ServiceCapability[];
  storyImage: string;
  storyImageAlt: string;
  storyTitle: string;
  story: string;
  deliveryIntro: string;
  deliveryStages: readonly ServiceDeliveryStage[];
  whyTitle: string;
  why: string;
  outcomes: readonly string[];
  /** Search-result title. `title` remains the on-page heading and nav label. */
  seoTitle: string;
  /** Meta description, kept separate from the on-page hero `description`. */
  metaDescription: string;
  audience: string;
  faqs: readonly ServiceFaq[];
  /** Paths of closely related services and solutions, linked from the page. */
  related: readonly string[];
}

const IMAGES = {
  managed: "/images/capabilities/managed-it.jpg",
  managedInfrastructure: "/images/capabilities/managed-it-infrastructure-services.webp",
  managedMaintenance: "/images/capabilities/managed-it-annual-maintenance.webp",
  managedFacility: "/images/capabilities/managed-it-facility-management.webp",
  managedHybrid: "/images/capabilities/managed-it-hybrid-services.webp",
  managedSupport: "/images/capabilities/managed-it-technical-support.webp",
  managedResilience: "/images/capabilities/managed-it-resilience-recovery.webp",
  consultancy: "/images/capabilities/it-consultancy.jpg",
  application: "/images/capabilities/application-services.jpg",
  applicationCustom: "/images/capabilities/application-custom-development.webp",
  applicationWebMobile: "/images/capabilities/application-web-mobile.webp",
  applicationIntegration: "/images/capabilities/application-enterprise-integration.webp",
  applicationModernization: "/images/capabilities/application-modernization-migration.webp",
  applicationManagement: "/images/capabilities/application-management.webp",
  applicationSpecialists: "/images/capabilities/application-specialist-delivery-service.webp",
  enterprise: "/images/capabilities/enterprise-solutions.jpg",
  enterpriseInfrastructure: "/images/capabilities/enterprise-it-infrastructure.webp",
  enterpriseDatacenter: "/images/capabilities/enterprise-data-centre.webp",
  enterpriseNetwork: "/images/capabilities/enterprise-network-infrastructure.webp",
  enterpriseWarranty: "/images/capabilities/enterprise-licensing-warranty.webp",
  enterpriseAutomation: "/images/capabilities/enterprise-business-automation.webp",
  enterpriseIntegration: "/images/capabilities/enterprise-system-integration.webp",
  cloud: "/images/capabilities/cloud-solutions.jpg",
  cloudInfrastructureServices: "/images/capabilities/cloud-infrastructure-services.webp",
  cloudMigration: "/images/capabilities/cloud-migration-modernization.webp",
  cloudProductivity: "/images/capabilities/cloud-email-productivity.webp",
  cloudBackup: "/images/capabilities/cloud-backup-recovery.webp",
  cloudSecurity: "/images/capabilities/cloud-security-compliance.webp",
  cloudManaged: "/images/capabilities/cloud-managed-services.webp",
  sap: "/images/capabilities/sap-consultancy.jpg",
  operations: "/images/catalog/enterprise-operations.jpg",
  engineering: "/images/catalog/software-engineering.jpg",
  advisory: "/images/catalog/advisory.jpg",
  telemetry: "/images/catalog/telemetry.jpg",
  datacenter: "/images/capabilities/datacenter-core.jpg",
  strategy: "/images/capabilities/strategy-board.jpg",
  engineeringTeam: "/images/catalog/software-engineering.jpg",
  technicalStaffing: "/images/capabilities/technical-staffing.jpg",
  staffingInfrastructure: "/images/capabilities/staffing-it-infrastructure.webp",
  staffingNetwork: "/images/capabilities/staffing-network-systems.webp",
  staffingCloud: "/images/capabilities/staffing-cloud-support.webp",
  staffingApplication: "/images/capabilities/staffing-application-software.webp",
  staffingEnterprise: "/images/capabilities/staffing-enterprise-specialists.webp",
  staffingProjects: "/images/capabilities/staffing-project-teams.webp",
  consultancyTechnologyStrategy: "/images/capabilities/it-consultancy-technology-strategy.webp",
  consultancySoa: "/images/capabilities/it-consultancy-soa.webp",
  consultancyInfrastructure: "/images/capabilities/it-consultancy-infrastructure.webp",
  consultancyCloud: "/images/capabilities/it-consultancy-cloud.webp",
  consultancyProjectGovernance: "/images/capabilities/it-consultancy-project-governance.webp",
  consultancyRiskCompliance: "/images/capabilities/it-consultancy-risk-compliance.webp",
  softwareLicenseAssessment: "/images/capabilities/software-license-assessment.webp",
  softwareRequirementAnalysis: "/images/capabilities/software-requirement-analysis.webp",
  softwareRenewalTracking: "/images/capabilities/software-renewal-tracking.webp",
  softwareUpgradeMigration: "/images/capabilities/software-upgrade-migration.webp",
  softwareComplianceSupport: "/images/capabilities/software-compliance-support.webp",
  sapDiscoveryEvaluation: "/images/capabilities/sap-discovery-evaluation.webp",
  sapS4hanaMigration: "/images/capabilities/sap-s4hana-migration.webp",
  sapImplementationRollout: "/images/capabilities/sap-implementation-rollout.webp",
  sapManagedServices: "/images/capabilities/sap-managed-services-ams.webp",
  sapBusinessProcessConsulting: "/images/capabilities/sap-business-process-consulting.webp",
  sapTechnologyConsulting: "/images/capabilities/sap-technology-consulting-upgrades.webp",
  analytics: "/images/catalog/telemetry.jpg",
  businessConsulting: "/images/catalog/advisory.jpg",
  workplace: "/images/catalog/enterprise-operations.jpg",
  cloudInfra: "/images/capabilities/cloud-infrastructure.jpg",
  sapLeadership: "/images/capabilities/technical-staffing.jpg",
} as const;

const SERVICE_CATALOG: readonly ServiceExperienceItem[] = [
  {
    slug: "managed-it-services",
    serviceNumber: "01",
    title: "Managed IT Services",
    shortTitle: "Managed IT",
    label: "Infrastructure operations",
    headline: "Keep critical technology dependable, supported, and ready to change.",
    description: "Infrastructure operations, maintenance, and technical support shaped around the systems your teams use every day.",
    introduction: "Siddiona supports the working life of enterprise infrastructure across on-premise, data-centre, and hybrid environments. Our approach combines practical oversight, structured maintenance, engineering support, and planned modernization so operational needs stay connected to longer-term technology decisions.",
    image: IMAGES.managed,
    imageAlt: "Engineers inspecting equipment in a data centre aisle",
    accent: "#67B7F7",
    heroMetrics: [
      { label: "Operational Model", value: "Multi-Tier Support" },
      { label: "Coverage Scope", value: "Hybrid & On-Premise" },
      { label: "Lifecycle Care", value: "Proactive Governance" },
    ],
    capabilities: [
      { title: "Infrastructure managed services", description: "Coordinated oversight for servers, networks, endpoints, and the dependencies around day-to-day operations.", image: IMAGES.managedInfrastructure, imageAlt: "Connected smart-city infrastructure presented above a digital tablet", imageFit: "contain", imageBackground: "#173D73" },
      { title: "Annual maintenance contracts", description: "Structured lifecycle care for business-critical IT equipment and infrastructure.", image: IMAGES.managedMaintenance, imageAlt: "AMC maintenance concept with gears, tools, and service technicians", imageFit: "contain", imageBackground: "#DCE8F4" },
      { title: "IT facility management", description: "On-site engineering and support coordinated around each operating environment.", image: IMAGES.managedFacility, imageAlt: "Facility management analytics displayed above an open book", imageFit: "contain", imageBackground: "#071114" },
      { title: "Hybrid IT services", description: "Co-managed support spanning established on-premise systems and cloud services.", image: IMAGES.managedHybrid, imageAlt: "People working from office and home in a hybrid work environment", imageFit: "contain", imageBackground: "#F1DFB6" },
      { title: "Technical support", description: "Issue triage, engineering assistance, and escalation for users and infrastructure teams.", image: IMAGES.managedSupport, imageAlt: "Technical support channels displayed above a tablet", imageFit: "contain", imageBackground: "#08152B" },
      { title: "Resilience and recovery", description: "Backup, recovery, cybersecurity, and network-support practices aligned to operational priorities.", image: IMAGES.managedResilience, imageAlt: "Engineers managing secure cloud-connected server infrastructure", imageFit: "contain", imageBackground: "#263A70" },
    ],
    storyImage: IMAGES.telemetry,
    storyImageAlt: "Infrastructure monitoring and operational displays",
    storyTitle: "One operating view across a mixed technology estate.",
    story: "Managed environments rarely fit one clean model. Siddiona connects maintenance, user support, infrastructure engineering, and recovery planning so responsibility stays clear across legacy, on-premise, and cloud systems.",
    deliveryIntro: "Our managed operations model brings stability and accountability across legacy, hybrid, and modern components through structured phases.",
    deliveryStages: [
      {
        step: "01",
        title: "Discovery & Infrastructure Baseline",
        tag: "Audit",
        description: "Complete inventory of physical hardware, hypervisors, network topology, warranty contracts, and service dependencies.",
      },
      {
        step: "02",
        title: "Service Transition & Runbook Setup",
        tag: "Transition",
        description: "Standard operating procedures, escalation matrices, monitoring probe deployment, and engineering knowledge transfer.",
      },
      {
        step: "03",
        title: "Continuous Operations & Triage",
        tag: "Execution",
        description: "Active incident handling, automated patch management, hardware health verification, and routine ticket resolution.",
      },
      {
        step: "04",
        title: "Lifecycle Review & Modernization",
        tag: "Optimization",
        description: "Quarterly reviews of recurring incidents, hardware renewal horizons, capacity forecasts, and platform enhancements.",
      },
    ],
    whyTitle: "Operational continuity needs accountable engineering.",
    why: "We bring infrastructure knowledge and long-term support into the same delivery model, helping teams handle immediate needs without losing sight of lifecycle and modernization work.",
    outcomes: [
      "Clear operational ownership across mixed estates",
      "Earlier visibility of recurring infrastructure issues",
      "Consistent hardware lifecycle and warranty care",
      "A practical bridge from legacy to modern platforms",
    ],
    seoTitle: "Managed IT Services & IT Support in New Delhi",
    metaDescription: "Managed IT services from Siddiona Technologies in New Delhi: infrastructure oversight, annual maintenance, on-site facility management and technical support.",
    audience: "For organisations that run servers, networks, end-user devices and business applications but don't want every operational task to rest on a small internal IT team. It suits companies with mixed on-premise and cloud estates, several offices, or equipment that needs structured maintenance and warranty tracking.",
    faqs: [
      {
        question: "What do your managed IT services cover?",
        answer: "The scope is agreed for each engagement and usually includes oversight of servers, networks and endpoints, preventive maintenance, user and engineering support, patching, and backup checks. We document what is covered, how issues are escalated, and how often we review the estate with you.",
      },
      {
        question: "Can you work alongside our existing IT team?",
        answer: "Yes. Co-managed support is a common model: your team keeps the decisions and systems it wants to own, and Siddiona takes on defined areas such as monitoring, maintenance, particular sites or escalation. Responsibilities are written into the runbook so nothing falls between teams.",
      },
      {
        question: "Do you provide on-site engineers?",
        answer: "IT facility management includes on-site engineering coordinated around your operating environment. Whether support is on-site, remote or a mix depends on the systems involved and the response the business needs, and it is agreed at the start of the engagement.",
      },
      {
        question: "How does a managed services engagement start?",
        answer: "With a discovery and baseline phase. We inventory hardware, hypervisors, network topology, warranty contracts and service dependencies, then set up runbooks, escalation paths and monitoring before day-to-day operations begin.",
      },
      {
        question: "Is this the same as an annual maintenance contract?",
        answer: "An AMC is one part of it. Annual maintenance focuses on planned upkeep and issue response for an agreed list of equipment. Managed IT services add ongoing operations, user support and lifecycle planning across the wider estate.",
      },
    ],
    related: ["/solutions/annual-maintenance-contract-services", "/solutions/backup-disaster-recovery", "/services/cloud-solutions"],
  },
  {
    slug: "it-consultancy-services",
    serviceNumber: "02",
    title: "IT Consultancy Services",
    shortTitle: "IT Consultancy",
    label: "Strategy and governance",
    headline: "Turn complex technology choices into a practical course of action.",
    description: "Assessment, planning, architecture, and delivery governance for technology decisions with lasting operational impact.",
    introduction: "Siddiona helps leaders understand the current environment, define a credible target state, and sequence change around business priorities. Our consultancy work joins technical assessment with delivery realities, giving decision-makers a clearer view of risk, investment, dependencies, and ownership.",
    image: IMAGES.consultancy,
    imageAlt: "Technology consultants collaborating around architectural plans",
    accent: "#63D2C0",
    heroMetrics: [
      { label: "Advisory Scope", value: "Enterprise Architecture" },
      { label: "Decision Model", value: "Risk & Capital Aligned" },
      { label: "Governance Focus", value: "Independent Oversight" },
    ],
    capabilities: [
      { title: "Technology strategy and planning", description: "Roadmaps that connect business priorities, architecture, investment, and delivery sequence.", image: IMAGES.consultancyTechnologyStrategy, imageAlt: "Technology consultant planning a connected cloud strategy and delivery roadmap", imageFit: "cover" },
      { title: "Architecture and SOA consulting", description: "Review of system boundaries, integration patterns, service architecture, and maintainability.", image: IMAGES.consultancySoa, imageAlt: "Service-oriented architecture diagram with tools, systems, and workflow symbols", imageFit: "contain", imageBackground: "#FFFFFF" },
      { title: "IT infrastructure consulting", description: "Assessment and planning for compute, storage, networking, workplace, and data-centre environments.", image: IMAGES.consultancyInfrastructure, imageAlt: "Connected enterprise infrastructure with cloud servers, databases, and workplace systems", imageFit: "contain", imageBackground: "#07186D" },
      { title: "Cloud consulting", description: "Workload assessment, platform direction, migration sequencing, and operating-model planning.", image: IMAGES.consultancyCloud, imageAlt: "Hand interacting with a cloud connected to digital technology services", imageFit: "contain", imageBackground: "#04080A" },
      { title: "Complex project governance", description: "Decision structures, delivery oversight, vendor coordination, and recovery planning for challenged initiatives.", image: IMAGES.consultancyProjectGovernance, imageAlt: "Project team coordinating schedules, analytics, and shared workflows", imageFit: "contain", imageBackground: "#EAF8FA" },
      { title: "Assessment, risk, and compliance", description: "Structured gap analysis and prioritized recommendations for technology, governance, and operational controls.", image: IMAGES.consultancyRiskCompliance, imageAlt: "Business professional crossing a risk gap toward a future objective", imageFit: "contain", imageBackground: "#6E9EB7" },
    ],
    storyImage: "/images/capabilities/consultancy-story.webp",
    storyImageAlt: "Consultants discussing a technology plan",
    storyTitle: "Advice designed to survive implementation.",
    story: "A useful recommendation must account for the people, platforms, budgets, and dependencies that will carry it. We keep strategy close to architecture and delivery so each decision can move from assessment into governed execution.",
    deliveryIntro: "We bridge the gap between high-level executive vision and engineering reality through disciplined consulting phases.",
    deliveryStages: [
      {
        step: "01",
        title: "Contextual Discovery & Constraint Analysis",
        tag: "Discovery",
        description: "Interviewing key stakeholders, assessing platform architecture, analyzing contracts, and establishing technical constraints.",
      },
      {
        step: "02",
        title: "Target State Architecture & Options",
        tag: "Design",
        description: "Formulating alternative target architectures, trade-off comparisons, total cost models, and vendor evaluations.",
      },
      {
        step: "03",
        title: "Phased Roadmap & Business Case",
        tag: "Strategy",
        description: "Sequencing technical initiatives into prioritized investment waves with clear milestones and resource requirements.",
      },
      {
        step: "04",
        title: "Governance & Delivery Assurance",
        tag: "Governance",
        description: "Providing ongoing architecture advisory, steering committee presence, and technical reviews during rollouts.",
      },
    ],
    whyTitle: "Clarity before commitment.",
    why: "Siddiona combines assessment, architecture, planning, and project governance. That connected view helps teams expose constraints early and align technology work with the business outcome it must support.",
    outcomes: [
      "Technology investments strictly tied to commercial priorities",
      "Early visibility of architectural, vendor, and delivery risks",
      "Practical sequencing of enterprise-wide modernizations",
      "Stronger governance and accountability around execution",
    ],
    seoTitle: "IT Consultancy Services in New Delhi & India",
    metaDescription: "IT consultancy from Siddiona Technologies: technology strategy, architecture, infrastructure and cloud consulting, and project governance in India.",
    audience: "For CIOs, IT heads and business leaders facing a technology decision with long-term consequences: a platform choice, an infrastructure refresh, a cloud move, or a programme that has drifted off course. It is equally useful when you want an independent view before committing budget.",
    faqs: [
      {
        question: "What does an IT consultancy engagement deliver?",
        answer: "Typically a documented assessment of the current environment, target-state options with their trade-offs and costs, and a phased roadmap with milestones and resourcing. Where it helps, we stay involved through steering reviews and architecture assurance during delivery.",
      },
      {
        question: "Are your recommendations tied to particular vendors?",
        answer: "Options are compared on fit, cost, risk and how easily your team can operate them, and vendor evaluation is part of the design phase. Where a recommendation involves products Siddiona can also supply, we say so plainly.",
      },
      {
        question: "How long does an IT assessment take?",
        answer: "It depends on the size of the estate and the question being answered. A focused review of one platform is shorter than an enterprise-wide architecture assessment. Scope, stakeholders and deliverables are agreed up front, so the timeline is clear before work starts.",
      },
      {
        question: "Can you help recover a project that is already in trouble?",
        answer: "Yes. Project governance covers decision structures, delivery oversight, vendor coordination and recovery planning for challenged initiatives. We start by establishing the facts on scope, dependencies, contracts and current risks before proposing a recovery plan.",
      },
      {
        question: "Do you also implement what you recommend?",
        answer: "We can. Siddiona's services span managed IT, cloud, applications, SAP and enterprise infrastructure, so a roadmap can move into delivery with the same team. You are equally free to take the roadmap to your own team or another provider.",
      },
    ],
    related: ["/solutions/data-center-migration-virtualization", "/services/cloud-solutions", "/services/software-licensing-compliance"],
  },
  {
    slug: "application-services",
    serviceNumber: "05",
    title: "Application Services",
    shortTitle: "Applications",
    label: "Engineering and integration",
    headline: "Build, connect, and modernize software around the work it must support.",
    description: "Application engineering, integration, modernization, and lifecycle support grounded in real business workflows.",
    introduction: "Siddiona helps organizations shape and evolve applications across their full lifecycle. We connect product thinking, engineering, integration, migration, and ongoing support so software remains useful to its users, maintainable for its owners, and adaptable as requirements change.",
    image: IMAGES.application,
    imageAlt: "Software engineer working across application code and interface designs",
    accent: "#A99AF8",
    heroMetrics: [
      { label: "Engineering Model", value: "Full-Lifecycle Agile" },
      { label: "Integration Standard", value: "RESTful & Event-Driven" },
      { label: "Code Quality", value: "Strict Automated CI/CD" },
    ],
    capabilities: [
      { title: "Custom application development", description: "Purpose-built software for distinct processes, users, and technical environments.", image: IMAGES.applicationCustom, imageAlt: "Designer building a custom application interface with connected digital features", imageFit: "contain", imageBackground: "#0E66BC" },
      { title: "Web and mobile applications", description: "Responsive products designed for usability, performance, security, and maintainable delivery.", image: IMAGES.applicationWebMobile, imageAlt: "Mobile application and web application platforms shown side by side", imageFit: "contain", imageBackground: "#EEF4FA" },
      { title: "Enterprise application integration", description: "APIs, middleware, data flows, and workflow connections across business systems.", image: IMAGES.applicationIntegration, imageAlt: "Application integration connecting enterprise systems, portals, commerce, and analytics", imageFit: "contain", imageBackground: "#B5D4E8" },
      { title: "Modernization and migration", description: "Progressive renewal of legacy applications, architecture, interfaces, and deployment practices.", image: IMAGES.applicationModernization, imageAlt: "Cloud modernization and migration architecture", imageFit: "contain", imageBackground: "#F59600" },
      { title: "Application management", description: "Maintenance, performance work, updates, and technical support across the application lifecycle.", image: IMAGES.applicationManagement, imageAlt: "Application management services concept with a lightbulb and hand-drawn planning marks", imageFit: "cover" },
      { title: "Specialist delivery capacity", description: "Technical professionals aligned to defined application work, team standards, and delivery needs.", image: IMAGES.applicationSpecialists, imageAlt: "Delivery service network connecting location, global reach, support, and customer satisfaction", imageFit: "contain", imageBackground: "#96D7F3" },
    ],
    storyImage: "/images/capabilities/application-story.webp",
    storyImageAlt: "Software developer working across application code",
    storyTitle: "Modernization without losing operational context.",
    story: "Applications sit inside a wider system of data, processes, users, and infrastructure. We treat integration and lifecycle ownership as part of the engineering work, not as concerns to resolve after launch.",
    deliveryIntro: "We follow an engineering-first lifecycle that guarantees maintainability, security, and smooth user adoption.",
    deliveryStages: [
      {
        step: "01",
        title: "Product Architecture & Specification",
        tag: "Discovery",
        description: "User journey mapping, domain data modeling, security requirements, and technical architecture specifications.",
      },
      {
        step: "02",
        title: "Iterative Sprint Development & CI/CD",
        tag: "Build",
        description: "Bi-weekly development sprints with automated linting, unit testing, containerized staging, and code reviews.",
      },
      {
        step: "03",
        title: "Quality Assurance & Security Hardening",
        tag: "Assurance",
        description: "Rigorous functional testing, cross-browser validation, API stress testing, and vulnerability remediation.",
      },
      {
        step: "04",
        title: "Governed Deployment & Ongoing SRE",
        tag: "Operations",
        description: "Zero-downtime production deployment, telemetry integration, user training, and continuous application support.",
      },
    ],
    whyTitle: "Engineering connected to the full application lifecycle.",
    why: "Our application work spans new development, integration, modernization, migration, and support. That continuity helps teams evolve software deliberately instead of creating another isolated system.",
    outcomes: [
      "Software purpose-built around actual operational workflows",
      "Seamless data flow between legacy systems and modern apps",
      "A disciplined, de-risked path for legacy application modernization",
      "Continuous performance and stability enhancements after launch",
    ],
    seoTitle: "Application Development & Integration Services",
    metaDescription: "Custom application development, web and mobile apps, enterprise integration, modernization and application support from Siddiona Technologies in New Delhi.",
    audience: "For organisations whose processes have outgrown spreadsheets or off-the-shelf tools, teams that need business systems to share data reliably, and owners of legacy applications that have become hard to change. Engagements range from a single integration to a full product build with ongoing support.",
    faqs: [
      {
        question: "What kinds of applications do you build?",
        answer: "Custom business applications, web applications and mobile apps designed around specific processes and users. Typical examples are internal platforms that operations teams rely on every day, client-facing portals, and the integration layers that connect them to ERP, identity and other line-of-business systems.",
      },
      {
        question: "Can you integrate our applications with SAP or Microsoft 365?",
        answer: "Yes. Enterprise application integration covers APIs, middleware, data flows and workflow connections across business systems, including ERP platforms such as SAP and productivity platforms such as Microsoft 365.",
      },
      {
        question: "How do you modernize a legacy application?",
        answer: "Progressively. We map how the application is used and what depends on it, then renew it in stages, covering interfaces, architecture, data and deployment practices, so the business keeps working while the system changes. A full rewrite is one option, not the default.",
      },
      {
        question: "How do you manage quality and security?",
        answer: "Development runs in short sprints with code review, automated testing and containerised staging. Before release, functional, cross-browser and API testing are combined with vulnerability remediation, and deployments are planned to avoid downtime.",
      },
      {
        question: "Do you support applications after launch?",
        answer: "Yes. Application management covers maintenance, performance work, updates and technical support. We can also provide specialist developers who work within your own team's standards.",
      },
    ],
    related: ["/services/sap-consultancy-services", "/services/cloud-solutions", "/solutions/data-center-migration-virtualization"],
  },
  {
    slug: "enterprise-solutions",
    serviceNumber: "04",
    title: "Enterprise Solutions",
    shortTitle: "Enterprise",
    label: "Systems and infrastructure",
    headline: "Bring infrastructure, platforms, and operations into one delivery picture.",
    description: "Integrated enterprise infrastructure and business systems shaped for complex operational environments.",
    introduction: "Siddiona brings together the technology layers that keep an enterprise operating—from data-centre and network infrastructure to software licensing, warranty management, outsourcing, automation, cloud platforms, and system integration. The aim is a solution that works as one environment rather than a set of disconnected purchases.",
    image: IMAGES.enterprise,
    imageAlt: "Enterprise operations team reviewing connected business systems",
    accent: "#F1A066",
    heroMetrics: [
      { label: "Infrastructure Scale", value: "Turnkey Architecture" },
      { label: "Procurement Model", value: "Validated BOQ & Handover" },
      { label: "Operational Depth", value: "Integrated Facilities" },
    ],
    capabilities: [
      { title: "IT infrastructure services", description: "Compute, storage, workplace, and supporting infrastructure planned around operational requirements.", image: IMAGES.enterpriseInfrastructure, imageAlt: "Connected enterprise infrastructure spanning data centre, cloud computing, cloud office, and file hosting", imageFit: "contain", imageBackground: "#092A83" },
      { title: "Data-centre solutions", description: "Infrastructure design and integration for resilient enterprise computing environments.", image: IMAGES.enterpriseDatacenter, imageAlt: "Bright enterprise data centre with rows of server cabinets", imageFit: "contain", imageBackground: "#E9EEF1" },
      { title: "Network infrastructure", description: "Campus, branch, and core network services that connect users, systems, and locations.", image: IMAGES.enterpriseNetwork, imageAlt: "Enterprise network diagram connecting internet, firewall, routing, switching, cloud, servers, wireless devices, and access controls", imageFit: "contain", imageBackground: "#FFFFFF" },
      { title: "Licensing and warranty management", description: "Coordinated software licensing and equipment lifecycle support across the estate.", image: IMAGES.enterpriseWarranty, imageAlt: "Warranty management software connecting devices, records, payments, and logistics", imageFit: "contain", imageBackground: "#E8ECFC" },
      { title: "Business automation", description: "Workflow and system improvements that reduce manual handoffs and fragmented operations.", image: IMAGES.enterpriseAutomation, imageAlt: "Business process automation workflow with analytics and decision paths", imageFit: "contain", imageBackground: "#168FE0" },
      { title: "System integration", description: "Connected delivery across infrastructure, cloud services, applications, and business platforms.", image: IMAGES.enterpriseIntegration, imageAlt: "Integrated cloud, server, database, application, and analytics systems", imageFit: "contain", imageBackground: "#020609" },
    ],
    storyImage: "/images/catalog/enterprise-operations.jpg",
    storyImageAlt: "People working in an enterprise operations environment",
    storyTitle: "Complex environments need integration, not accumulation.",
    story: "Enterprise technology spans facilities, platforms, contracts, teams, and operational processes. Siddiona coordinates these layers as a connected programme so handoffs, ownership, and dependencies remain visible.",
    deliveryIntro: "From initial architectural schematics to on-site commissioning and warranty care, our enterprise delivery is governed end-to-end.",
    deliveryStages: [
      {
        step: "01",
        title: "Requirement Engineering & BOQ Prep",
        tag: "Planning",
        description: "Rigorous capacity modeling, network topology schematics, power calculations, and detailed Bill of Quantities.",
      },
      {
        step: "02",
        title: "Staging, Configuration & Burn-in",
        tag: "Staging",
        description: "Hardware pre-configuration, firmware alignment, hypervisor installation, and stress testing before facility dispatch.",
      },
      {
        step: "03",
        title: "On-Site Commissioning & Cutover",
        tag: "Integration",
        description: "Physical rack-and-stack, structured cabling dressing, cluster turnup, security validation, and cutover testing.",
      },
      {
        step: "04",
        title: "Warranty Governance & Handover",
        tag: "Lifecycle",
        description: "OEM warranty registration, tier-level escalation setup, client team orientation, and scheduled lifecycle audits.",
      },
    ],
    whyTitle: "One view across operational complexity.",
    why: "We work across infrastructure, networks, cloud, business systems, and lifecycle services. That breadth helps enterprises coordinate interdependent work without treating every layer as a separate project.",
    outcomes: [
      "Infrastructure decisions aligned to enterprise operations",
      "Clear visibility into inter-system dependencies and licensing",
      "Coordinated procurement, warranty, and hardware lifecycles",
      "Turnkey delivery backed by comprehensive as-built documentation",
    ],
    seoTitle: "Enterprise IT Infrastructure & System Integration",
    metaDescription: "Enterprise IT from Siddiona Technologies: infrastructure, data centre and network builds, licensing and warranty management, automation and system integration.",
    audience: "For enterprises, campuses and multi-site organisations commissioning infrastructure: a new data-centre build, a network upgrade, a server and storage refresh, or several of these at once. It suits teams that would rather have one accountable integrator than coordinate separate suppliers for hardware, software, installation and warranty.",
    faqs: [
      {
        question: "What is included in an enterprise infrastructure project?",
        answer: "Projects run from requirement engineering and a detailed Bill of Quantities (BOQ), through hardware staging, configuration and burn-in, to on-site rack-and-stack, structured cabling, commissioning and cutover. They close with OEM warranty registration, escalation setup and as-built documentation.",
      },
      {
        question: "Do you supply hardware and software as well as installing it?",
        answer: "Procurement coordination is part of the delivery model, together with licensing and warranty management. The bill of quantities is validated against the design before anything is ordered, so what arrives on site matches what was engineered.",
      },
      {
        question: "Can you deliver across multiple sites?",
        answer: "Yes. Campus, branch and core network services are part of the scope, and delivery is planned so each site has defined staging, commissioning and handover steps.",
      },
      {
        question: "What happens after handover?",
        answer: "Warranty governance continues after go-live: OEM registrations, tier-level escalation and scheduled lifecycle audits. Many organisations then move the estate onto an annual maintenance contract or managed IT services.",
      },
      {
        question: "How does this relate to your Solutions pages?",
        answer: "Enterprise Solutions is the broad infrastructure and integration service. The Solutions pages describe four focused offerings that draw on it: backup and disaster recovery, data center migration and virtualization, smart classrooms and AV, and annual maintenance.",
      },
    ],
    related: ["/solutions/data-center-migration-virtualization", "/solutions/smart-classrooms-av-systems", "/solutions/annual-maintenance-contract-services"],
  },
  {
    slug: "cloud-solutions",
    serviceNumber: "06",
    title: "Cloud Solution",
    shortTitle: "Cloud",
    label: "Platforms and migration",
    headline: "Move to cloud with an architecture your teams can operate confidently.",
    description: "Cloud infrastructure, migration, productivity, recovery, security, and managed operations treated as one system.",
    introduction: "Cloud adoption works best when platform design, migration, security, recovery, operations, and cost are considered together. Siddiona helps teams assess workloads, establish the right foundation, move deliberately, and define how the environment will be managed after launch.",
    image: IMAGES.cloud,
    imageAlt: "Cloud engineering team working in an enterprise operations centre",
    accent: "#75AFFF",
    heroMetrics: [
      { label: "Deployment Paradigm", value: "Multi-Cloud & Hybrid" },
      { label: "Migration Risk", value: "De-Risked Staged Waves" },
      { label: "Governance Model", value: "FinOps & Security First" },
    ],
    capabilities: [
      { title: "Cloud infrastructure services", description: "Compute, storage, networking, identity, and environment foundations for operational workloads.", image: IMAGES.cloudInfrastructureServices, imageAlt: "Digital cloud infrastructure connected across a city network", imageFit: "contain", imageBackground: "#11134A" },
      { title: "Cloud migration and modernization", description: "Assessment and staged movement of applications, databases, and infrastructure.", image: IMAGES.cloudMigration, imageAlt: "Cloud migration connecting applications and devices to a cloud platform", imageFit: "contain", imageBackground: "#F7F7F7" },
      { title: "Cloud email and productivity", description: "Planning, migration, and administration for cloud-based communication and collaboration platforms.", image: IMAGES.cloudProductivity, imageAlt: "Workplace users connecting computers and mobile devices through cloud services", imageFit: "contain", imageBackground: "#9ABBAE" },
      { title: "Backup and disaster recovery", description: "Backup architecture and recovery planning aligned to workload and business priorities.", image: IMAGES.cloudBackup, imageAlt: "Cloud backup connecting servers, computers, tablets, and phones", imageFit: "contain", imageBackground: "#F3F3F3" },
      { title: "Cloud security and compliance", description: "Identity, configuration, visibility, and control review across cloud environments.", image: IMAGES.cloudSecurity, imageAlt: "Cloud compliance model connecting governance, encryption, regulations, frameworks, threat modeling, and shared responsibility", imageFit: "contain", imageBackground: "#080A4B" },
      { title: "Managed cloud services", description: "Ongoing administration, observability, review, and cost governance after migration.", image: IMAGES.cloudManaged, imageAlt: "Managed cloud service model covering scale, security, reliability, agility, and change management", imageFit: "contain", imageBackground: "#FFFFFF" },
    ],
    storyImage: "/images/capabilities/cloud-story.webp",
    storyImageAlt: "Technology teams collaborating using cloud productivity tools",
    storyTitle: "The migration is only one part of the operating model.",
    story: "A cloud environment must remain secure, observable, recoverable, and understandable after workloads arrive. We connect foundation design and migration with the operational practices that follow.",
    deliveryIntro: "Our cloud adoption framework balances speed with security, ensuring every workload lands on a fully governed foundation.",
    deliveryStages: [
      {
        step: "01",
        title: "Workload Readiness & TCO Analysis",
        tag: "Assessment",
        description: "Evaluating application dependencies, data volumes, regulatory requirements, and long-term operating costs.",
      },
      {
        step: "02",
        title: "Landing Zone Architecture & Terraform",
        tag: "Foundation",
        description: "Automated provisioning of security baselines, network routing, identity federation, and logging repositories.",
      },
      {
        step: "03",
        title: "Pilot Migration & Cutover Waves",
        tag: "Migration",
        description: "Executing data replication, pilot dry runs, acceptance testing, and governed production cutovers.",
      },
      {
        step: "04",
        title: "Post-Migration FinOps & Governance",
        tag: "Optimization",
        description: "Continuous cost right-sizing, automated snapshots, observability tuning, and recurring architecture reviews.",
      },
    ],
    whyTitle: "Cloud decisions joined to day-two operations.",
    why: "Siddiona works across migration, infrastructure, security, recovery, and managed cloud operations. This keeps the destination architecture tied to the team and processes responsible for running it.",
    outcomes: [
      "Cloud architecture tailored to actual workload requirements",
      "Predictable, de-risked migration stages with minimal interruption",
      "Real-time operational observability and security posture",
      "Continuous cost governance and resource right-sizing",
    ],
    seoTitle: "Cloud Migration & Managed Cloud Services",
    metaDescription: "Cloud solutions from Siddiona Technologies, New Delhi: cloud infrastructure, migration, email and productivity, backup and recovery, security and managed cloud.",
    audience: "For organisations moving workloads from on-premise servers to the public cloud, consolidating email and collaboration onto a cloud platform, or already in the cloud but without clear security, recovery and cost controls.",
    faqs: [
      // TODO(verify): confirm the cloud platforms Siddiona actively delivers on.
      // The homepage partner strip shows Microsoft, AWS and Google Cloud.
      {
        question: "Which cloud platforms do you work with?",
        answer: "We work with the major public cloud platforms, including Microsoft Azure, AWS and Google Cloud, as well as hybrid environments that keep some workloads on-premise. The platform is chosen during assessment, based on workload requirements, existing skills and long-term operating cost.",
      },
      {
        question: "How do you migrate workloads without disrupting the business?",
        answer: "In stages. After a readiness and cost assessment, we build a governed landing zone, run pilot migrations and dry runs, then move workloads in planned cutover waves with acceptance testing at each step.",
      },
      {
        question: "Can you migrate our email to the cloud?",
        answer: "Yes. Cloud email and productivity covers planning, migration and administration for cloud-based communication and collaboration platforms, including mailbox moves, identity and user cutover.",
      },
      {
        question: "How do you keep cloud costs under control?",
        answer: "Cost is considered from the start through total-cost-of-ownership analysis, and after migration through ongoing right-sizing, scheduled reviews and FinOps practices, so spend tracks actual usage.",
      },
      {
        question: "Do you manage the cloud environment after migration?",
        answer: "Managed cloud services cover ongoing administration, observability, security review, backups and cost governance, so the environment stays secure and well understood after the project team steps back.",
      },
    ],
    related: ["/solutions/backup-disaster-recovery", "/solutions/data-center-migration-virtualization", "/services/managed-it-services"],
  },
  {
    slug: "sap-consultancy-services",
    serviceNumber: "03",
    title: "SAP Consultancy Services",
    shortTitle: "SAP Consultancy",
    label: "Enterprise applications",
    headline: "Align SAP change with the processes the business depends on.",
    description: "SAP assessment, migration, implementation, rollout, consulting, and application support grounded in operational reality.",
    introduction: "SAP landscapes carry processes that an enterprise cannot afford to misunderstand. Siddiona supports discovery, implementation, migration, rollout, improvement, and application management—connecting platform decisions to business processes, integrations, users, and ongoing ownership.",
    image: IMAGES.sap,
    imageAlt: "Enterprise technology professionals working in a modern operations office",
    imagePosition: "center 44%",
    accent: "#F0A56B",
    heroMetrics: [
      { label: "ERP Focus", value: "SAP Transformation" },
      { label: "Alignment", value: "Process & Function" },
      { label: "Support Depth", value: "Dedicated AMS" },
    ],
    capabilities: [
      { title: "SAP discovery and evaluation", description: "Structured assessment of the current landscape, business requirements, dependencies, and change priorities.", image: IMAGES.sapDiscoveryEvaluation, imageAlt: "SAP platform capabilities represented through connected operational gears", imageFit: "contain", imageBackground: "#172B35" },
      { title: "S/4HANA migration", description: "Assessment and staged transition planning for modern SAP environments.", image: IMAGES.sapS4hanaMigration, imageAlt: "Six-stage SAP S/4HANA assessment and migration process", imageFit: "contain", imageBackground: "#FFFFFF" },
      { title: "Implementation and rollout", description: "Coordinated deployment across functions, users, processes, and locations.", image: IMAGES.sapImplementationRollout, imageAlt: "SAP rollout plan progressing through implementation, design, strategy, employee needs, and direction", imageFit: "contain", imageBackground: "#F3F3F3" },
      { title: "SAP managed services and AMS", description: "Ongoing functional and technical support for business-critical SAP operations.", image: IMAGES.sapManagedServices, imageAlt: "SAP managed services across applications, data centers, infrastructure, networks, databases, systems, and service desk operations", imageFit: "contain", imageBackground: "#FFFFFF" },
      { title: "Business and process consulting", description: "Alignment of SAP capabilities with operating processes, governance, and change priorities.", image: IMAGES.sapBusinessProcessConsulting, imageAlt: "Digital consulting interface connecting strategy, analysis, people, and business targets", imageFit: "contain", imageBackground: "#041B39" },
      { title: "Technology consulting and upgrades", description: "Platform, integration, extension, and upgrade guidance for an evolving SAP landscape.", image: IMAGES.sapTechnologyConsulting, imageAlt: "Technology consulting areas including digital transformation, cloud, security, artificial intelligence, and ERP", imageFit: "contain", imageBackground: "#FFFFFF" },
    ],
    storyImage: "/images/capabilities/sap-story.webp",
    storyImageAlt: "Enterprise specialists mapping processes and application requirements",
    storyTitle: "Platform change must follow process truth.",
    story: "SAP programmes cross finance, operations, data, integration, and organizational change. We keep the technical landscape connected to process decisions so implementation and support reflect how the enterprise actually works.",
    deliveryIntro: "We orchestrate SAP transformation through structured stages that safeguard core transaction processing throughout the change cycle.",
    deliveryStages: [
      {
        step: "01",
        title: "Landscape Discovery & Custom Code Audit",
        tag: "Discovery",
        description: "System profiling, transaction log analysis, custom modification inventory, and S/4HANA readiness assessment.",
      },
      {
        step: "02",
        title: "Business Blueprint & Process Architecture",
        tag: "Blueprint",
        description: "Mapping end-to-end business processes, defining integration touchpoints, and preparing data migration templates.",
      },
      {
        step: "03",
        title: "Configuration, Testing & Mock Cutovers",
        tag: "Realization",
        description: "System customizing, data cleansing, end-to-end integration testing, user acceptance, and dress-rehearsal cutovers.",
      },
      {
        step: "04",
        title: "Go-Live Hypercare & Sustained AMS",
        tag: "Hypercare",
        description: "On-site go-live support, issue burn-down, user coaching, and seamless transition to long-term AMS support.",
      },
    ],
    whyTitle: "ERP strategy, delivery, and support in one line of sight.",
    why: "Siddiona connects discovery, migration, implementation, process consulting, and application management. That continuity helps reduce gaps between programme decisions and ongoing SAP operations.",
    outcomes: [
      "Tighter alignment between standard ERP capabilities and business processes",
      "Controlled, audited rollouts across operating entities",
      "Clear ownership of custom code and interfaces",
      "Focused modernization with zero disruption to financial and operational reporting",
    ],
    seoTitle: "SAP Consultancy & S/4HANA Migration Services",
    metaDescription: "SAP consultancy from Siddiona Technologies in New Delhi: landscape discovery, S/4HANA migration, implementation and rollout, and application management (AMS).",
    audience: "For organisations running SAP that are planning a move to S/4HANA, extending SAP to new entities or locations, or looking for dependable application management after go-live. Finance, operations and IT all have a stake in the outcome, so we work across business and technical teams.",
    faqs: [
      {
        question: "Do you help with migration to SAP S/4HANA?",
        answer: "Yes. We start with landscape discovery: system profiling, a custom code inventory and an S/4HANA readiness assessment. That informs the migration approach, the business blueprint, data migration templates and a staged transition plan with mock cutovers before go-live.",
      },
      {
        question: "What is SAP AMS?",
        answer: "Application Management Services is ongoing functional and technical support for a live SAP system: incident handling, small enhancements, user support, and keeping custom code and interfaces under control. Siddiona provides AMS on its own or as the next step after an implementation's hypercare period.",
      },
      {
        question: "Can you roll out SAP to a new company, plant or location?",
        answer: "Implementation and rollout covers coordinated deployment across functions, users, processes and locations, including configuration, testing, user preparation and go-live support for each wave.",
      },
      {
        question: "How do you protect day-to-day operations during SAP change?",
        answer: "Through process mapping before configuration, end-to-end integration testing, user acceptance and dress-rehearsal cutovers. Go-live is followed by hypercare, so issues are worked down before support moves to the long-term model.",
      },
      {
        question: "Do you only work on SAP?",
        answer: "SAP consultancy is one of eight Siddiona services. Because an SAP landscape depends on infrastructure, integration and licensing, that related work can be handled by our application, cloud, enterprise and licensing teams where it is useful.",
      },
    ],
    related: ["/services/application-services", "/solutions/data-center-migration-virtualization", "/services/software-licensing-compliance"],
  },
  {
    slug: "staffing-solutions",
    serviceNumber: "07",
    title: "Staffing Solutions",
    shortTitle: "Staffing",
    label: "Technology workforce support",
    headline: "Align technical capability with changing project and operational needs.",
    description: "Technology staffing and workforce support for organizations that need role-based expertise and scalable technical teams.",
    introduction: "Siddiona helps organizations identify, source, and deploy technical resources around defined project, platform, and operational requirements. The service supports changing workloads without requiring every capability to become a permanent internal role, while keeping responsibilities, team integration, and knowledge continuity visible.",
    image: IMAGES.technicalStaffing,
    imageAlt: "Technology professionals collaborating around a conference table",
    imagePosition: "center 46%",
    accent: "#8FBDB9",
    heroMetrics: [
      { label: "Workforce Model", value: "Flexible Technical Teams" },
      { label: "Role Alignment", value: "Capability-Led Sourcing" },
      { label: "Delivery Context", value: "Project & Operations" },
    ],
    capabilities: [
      { title: "IT infrastructure staffing", description: "Technical resources aligned to infrastructure operations, maintenance, workplace systems, and data-centre requirements.", image: IMAGES.staffingInfrastructure, imageAlt: "Technology team collaborating around infrastructure monitoring workstations", imageFit: "contain", imageBackground: "#8D999A" },
      { title: "Network and systems staffing", description: "Role-based support for network administration, systems engineering, monitoring, and operational coordination.", image: IMAGES.staffingNetwork, imageAlt: "Digital workforce selection across a connected technology network", imageFit: "contain", imageBackground: "#061722" },
      { title: "Cloud and technical support roles", description: "Resources for cloud operations, migration workstreams, service support, and platform administration.", image: IMAGES.staffingCloud, imageAlt: "Cloud server platform connected to distributed technology nodes", imageFit: "contain", imageBackground: "#D180C8" },
      { title: "Application and software resources", description: "Development, integration, testing, and application-support capability matched to defined delivery needs.", image: IMAGES.staffingApplication, imageAlt: "Laptop surrounded by application and software icons", imageFit: "contain", imageBackground: "#E8F0F5" },
      { title: "Enterprise technology specialists", description: "Specialist capability for enterprise platforms, technical programmes, and cross-functional technology environments.", image: IMAGES.staffingEnterprise, imageAlt: "Enterprise specialists reviewing project documents around a conference table", imageFit: "contain", imageBackground: "#D6E6E8" },
      { title: "Project-based technical teams", description: "Coordinated technical capacity that can scale with project phases, workloads, and established governance.", image: IMAGES.staffingProjects, imageAlt: "Project teams coordinating work around interconnected gears", imageFit: "contain", imageBackground: "#FFFFFF" },
    ],
    storyImage: IMAGES.technicalStaffing,
    storyImageAlt: "Technology team working together with laptops in an enterprise meeting room",
    storyTitle: "Technical staffing starts with the work, not a generic role list.",
    story: "Useful staffing decisions connect platform knowledge, delivery responsibilities, and team fit to the requirement at hand. Siddiona considers how each resource will contribute within the organization's technical standards, project cadence, and operating model.",
    deliveryIntro: "We translate workload and capability requirements into a practical staffing model, then support resource alignment, integration, and review throughout the engagement.",
    deliveryStages: [
      { step: "01", title: "Requirement and Role Definition", tag: "Assess", description: "Clarify the technology environment, workload, responsibilities, required capabilities, and engagement constraints." },
      { step: "02", title: "Capability Matching and Team Design", tag: "Align", description: "Shape role profiles and team composition around the technical scope, delivery model, and internal ownership." },
      { step: "03", title: "Resource Deployment and Integration", tag: "Deploy", description: "Coordinate onboarding into the relevant tools, standards, workstreams, and communication practices." },
      { step: "04", title: "Workforce Review and Scaling", tag: "Adapt", description: "Review changing workload requirements, resource alignment, documentation, and knowledge continuity." },
    ],
    whyTitle: "Technology resources aligned to real delivery requirements.",
    why: "Siddiona approaches staffing as part of technology delivery. Role definition, capability matching, team integration, and flexible scaling remain connected to the systems, projects, and operational responsibilities the resources will support.",
    outcomes: [
      "Technical capability matched to defined organizational requirements",
      "Flexible team capacity for changing projects and workloads",
      "Clear responsibilities across internal and deployed resources",
      "Workforce planning connected to delivery and operational priorities",
    ],
    seoTitle: "IT Staffing & Technical Resource Augmentation",
    metaDescription: "IT staffing solutions from Siddiona Technologies in New Delhi: infrastructure, network, cloud, application and enterprise specialists, and project-based teams.",
    audience: "For IT departments and project teams that need extra technical capacity for a defined period, a skill they don't have in-house, or a team that can scale with a project's phases, without turning every requirement into a permanent hire.",
    faqs: [
      {
        question: "What roles can you provide?",
        answer: "Technical resources across IT infrastructure, network and systems administration, cloud operations and support, application development and testing, and enterprise technology specialists. Each role is defined against your environment and responsibilities before matching begins.",
      },
      {
        question: "Is this individual staffing or a managed team?",
        answer: "Both are possible. You can bring in individual specialists who work within your team, or a coordinated project team that scales with project phases under agreed governance. The model is set during requirement and role definition.",
      },
      {
        question: "How do you choose the right people?",
        answer: "Matching starts from the work rather than a job title: the platforms involved, the responsibilities, team standards and how the role fits your operating model. Role profiles and team composition are agreed with you before resources are deployed.",
      },
      {
        question: "What happens if our requirements change?",
        answer: "Workforce review is part of the engagement. We review workload, resource alignment and documentation with you regularly, and scale the team up or down as projects and operations change, with attention to knowledge continuity.",
      },
    ],
    related: ["/services/managed-it-services", "/services/application-services", "/services/cloud-solutions"],
  },
  {
    slug: "software-licensing-compliance",
    serviceNumber: "08",
    title: "Software Licensing & Compliance",
    shortTitle: "Software Licensing",
    label: "Software lifecycle and license governance",
    headline: "Bring visibility and control to software licensing across the enterprise.",
    description: "Software licensing, lifecycle, and compliance support for organizations managing multiple products, users, deployments, and renewals.",
    introduction: "Siddiona supports organizations in understanding what software is required, where licenses are allocated, how products are deployed, and when renewals or upgrades need attention. The service connects license assessment, procurement coordination, implementation, records, and usage review to improve control and compliance readiness across the software lifecycle.",
    image: IMAGES.telemetry,
    imageAlt: "Enterprise software inventory and usage information displayed on operational screens",
    accent: "#7CA6D8",
    heroMetrics: [
      { label: "Management Scope", value: "License Lifecycle" },
      { label: "Operational View", value: "Inventory & Allocation" },
      { label: "Governance Focus", value: "Compliance Readiness" },
    ],
    capabilities: [
      { title: "License assessment and inventory", description: "Structured review of installed products, license records, users, devices, allocations, and current software requirements.", image: IMAGES.softwareLicenseAssessment, imageAlt: "Software license record with installation media and cloud delivery", imageFit: "contain", imageBackground: "#B8DCEC" },
      { title: "Requirement analysis and licensing coordination", description: "Alignment of operating systems, productivity, endpoint protection, accounting, ERP, and other software needs with appropriate licensing routes.", image: IMAGES.softwareRequirementAnalysis, imageAlt: "Software requirement analysis across evaluation, design, implementation, testing, and lifecycle", imageFit: "contain", imageBackground: "#56306B" },
      { title: "Renewal, allocation, and tracking", description: "Centralized attention to renewal dates, license assignment, reassignment, utilization, and supporting documentation.", image: IMAGES.softwareRenewalTracking, imageAlt: "Software access and identity controls with authentication and account security", imageFit: "contain", imageBackground: "#4C0B3D" },
      { title: "Deployment and configuration", description: "Coordinated software installation, configuration, customization, and rollout across relevant users and systems.", image: IMAGES.engineering, imageAlt: "Software deployment and configuration workspace" },
      { title: "Software upgrade and migration", description: "Planning and technical support for version upgrades, platform transitions, compatibility considerations, and controlled migration.", image: IMAGES.softwareUpgradeMigration, imageAlt: "Seven-stage software migration cycle from analysis through maintenance", imageFit: "contain", imageBackground: "#FFFFFF" },
      { title: "Usage review and compliance support", description: "Review of license use, entitlements, records, and gaps to support responsible management and compliance readiness.", image: IMAGES.softwareComplianceSupport, imageAlt: "Compliance framework connecting policies, standards, laws, transparency, governance, requirements, regulations, and rules", imageFit: "contain", imageBackground: "#1C2C39" },
    ],
    storyImage: IMAGES.enterprise,
    storyImageAlt: "Enterprise team reviewing connected technology systems",
    storyTitle: "Licensing decisions continue long after procurement.",
    story: "Software ownership spans requirements, commercial records, deployment, access, upgrades, renewals, and retirement. Treating those activities as one lifecycle gives technology and procurement teams a clearer basis for allocation, planning, and compliance support.",
    deliveryIntro: "We establish the current licensing picture, align requirements and records, coordinate deployment activity, and maintain a review cycle around usage and renewals.",
    deliveryStages: [
      { step: "01", title: "License Discovery and Inventory", tag: "Assess", description: "Collect available software, entitlement, deployment, user, device, and renewal information into a working inventory." },
      { step: "02", title: "Requirement and Gap Analysis", tag: "Analyze", description: "Compare organizational requirements, current allocations, usage patterns, and lifecycle needs to identify actions and documentation gaps." },
      { step: "03", title: "Licensing and Deployment Coordination", tag: "Manage", description: "Support procurement coordination, allocation, installation, configuration, and migration activities across the agreed software scope." },
      { step: "04", title: "Usage, Renewal, and Record Review", tag: "Govern", description: "Maintain visibility of usage, renewal milestones, license records, changes, and compliance-readiness considerations." },
    ],
    whyTitle: "One operating view of software, licenses, and lifecycle decisions.",
    why: "Siddiona connects licensing administration with the technical work of deploying, configuring, supporting, upgrading, and retiring software. This gives stakeholders clearer records and more consistent control without presenting operational support as legal certification.",
    outcomes: [
      "Improved visibility of software inventory and license allocation",
      "Clearer coordination of procurement, deployment, and renewals",
      "More consistent license records and lifecycle documentation",
      "Practical support for usage review and compliance readiness",
    ],
    seoTitle: "Software Licensing & License Compliance Services",
    metaDescription: "Software licensing and compliance support from Siddiona Technologies: license assessment, procurement, renewals, deployment, upgrades and usage review.",
    audience: "For IT and procurement teams managing many software products across users and devices, from operating systems and productivity suites to endpoint protection, accounting and ERP, who need a clear picture of what is licensed, what is deployed and what is due for renewal.",
    faqs: [
      {
        question: "What does a software license assessment involve?",
        answer: "A structured review of installed products, license records, users, devices and current allocations, compared against what the organisation actually needs. The result is a working inventory and a list of gaps and actions.",
      },
      {
        question: "Can you help us buy the right licenses?",
        answer: "Yes. Requirement analysis aligns operating systems, productivity, endpoint protection, accounting, ERP and other software needs with appropriate licensing routes, and we coordinate procurement within the agreed scope.",
      },
      {
        question: "Do you track renewals?",
        answer: "Renewal dates, license assignment and reassignment, utilisation and supporting documentation are tracked centrally, so renewals are planned rather than discovered at the last minute.",
      },
      {
        question: "Is this a legal compliance audit?",
        answer: "No. We provide operational support for license management and compliance readiness: clearer records, usage review and gap identification. It is not legal certification or advice, and formal vendor audits remain between you and the vendor.",
      },
      {
        question: "Can you install and upgrade the software too?",
        answer: "Deployment and configuration, version upgrades and platform migrations are part of the service, so licensing decisions and the technical work behind them stay connected.",
      },
    ],
    related: ["/services/enterprise-solutions", "/services/it-consultancy-services", "/services/sap-consultancy-services"],
  },
] as const;

// Detail pages, numbering, and cyclic Previous/Next links share this exact order.
const SERVICE_ORDER = [
  "managed-it-services",
  "it-consultancy-services",
  "sap-consultancy-services",
  "enterprise-solutions",
  "application-services",
  "cloud-solutions",
  "staffing-solutions",
  "software-licensing-compliance",
] as const;

export const SERVICES: readonly ServiceExperienceItem[] = SERVICE_ORDER.map((slug) => {
  const service = SERVICE_CATALOG.find((item) => item.slug === slug);
  if (!service) throw new Error(`Missing service data for ${slug}`);
  return service;
});

export function getService(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}
