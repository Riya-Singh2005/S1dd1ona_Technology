# Siddiona Website Information Architecture & Sitemap

## Current Solutions Routes (October 5, 2026)

The Solutions portion of the original blueprint below is historical. The current public portfolio is `/solutions` plus these four dedicated routes:

- `/solutions/backup-disaster-recovery`
- `/solutions/data-center-migration-virtualization`
- `/solutions/smart-classrooms-av-systems`
- `/solutions/annual-maintenance-contract-services`

Desktop navigation uses four simple links in a 2×2 layout; mobile exposes the same four links beneath the overview link. The sitemap uses the current navigation data on `https://siddiona.com` and excludes retired Solution URLs. Existing permanent legacy redirects are unchanged.

All detail pages share a full-height shader hero, operating-context overview, icon-led core capabilities, numbered delivery sequence, operational value, environments, and technical considerations. AMC additionally includes its support-model comparison; Smart Classrooms includes the room topology. No in-hero contact CTA, orange closing CTA, or previous/next navigation is rendered. The navbar contact action remains available.

**Project:** Siddiona Technologies Services Pvt. Ltd. (`siddiona.com`)  
**Scope:** Complete Enterprise Sitemap, Routing Blueprint & User Flows  
**Status:** Approved Specification  

---

## 1. Information Architecture Hierarchy

```
/ (Homepage)
├── /about/ (Company Overview, Vision, Story, Metrics, ISO Governance)
├── /our-team/ (Executive Leadership Profiles & Governance)
├── /service/ (Services Catalog Directory Hub)
│   ├── /service/managed-it-service/
│   ├── /service/it-consultancy-service/
│   ├── /service/enterprise-solution/
│   ├── /service/application-service/
│   ├── /service/cloud-solutions/
│   ├── /service/sap-consulting-services/
│   └── /service/why-siddiona-technologies/
├── /solutions/ (Smart Infrastructure & ELV Solutions Hub)
│   ├── /solutions/room-automation/
│   ├── /solutions/surveillance-camera/
│   ├── /solutions/public-address-system/
│   ├── /solutions/access-control-system/
│   ├── /solutions/water-detection-system/
│   ├── /solutions/data-voice-networking/
│   ├── /solutions/telecom-network/
│   ├── /solutions/video-conferencing/
│   ├── /solutions/fire-detection/
│   ├── /solutions/rodent-repellent/
│   ├── /solutions/bms-scada/
│   └── /solutions/ups/
├── /partnership/ (Authorized OEM Partners & ISO Certifications)
├── /career/ (Hiring Portal, Culture, Active Openings Hub)
│   └── /career/[slug]/ (Role Description & Direct Resume Intake)
├── /contact/ (Enterprise RFP Intake, Direct Phone, WhatsApp & Office Details)
├── /privacy-policy/ (Data Protection & Privacy Policy)
└── /terms-of-service/ (Terms of Service & Engagement Conditions)
```

---

## 2. Detailed Route Blueprint

### 2.1 Core Brand & Discovery Routes

| Route | Purpose | Target Audience | Primary CTA | Key Sections | SEO Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** (Home) | High-authority overview of enterprise IT consulting, cloud transformation, and smart infrastructure. | CTOs, IT Directors, Founders, Procurement Heads | "Schedule Consultation" & "Explore Services" | Hero Value Prop, Metrics Counter, Services Matrix, Why Siddiona, Solutions Showcase, OEM Partners, ISO Badges, Testimonials | "Enterprise IT solutions India", "Cloud migration consultancy", "IT system integrator Delhi" |
| **`/about/`** | Articulate founding history, growth trajectory, ISO governance, and operating scale. | Evaluators, Enterprise Clients, prospective partners | "Partner With Us" | Company Narrative, Mission & Vision, Operational Metrics (100+ Accounts, 3M+ Revenue), Core Values, ISO Management System | "About Siddiona Technologies", "IT infrastructure company Delhi" |
| **`/our-team/`** | Humanize the executive leadership and demonstrate specialized governance. | Decision-makers, Enterprise Procurement | "Connect with Leadership" | Executive profiles (Mamta Kargeti, Saumya Mohanty, Dushyant Nagar), Focus Areas, LinkedIn connect links | "Siddiona leadership team", "IT consulting management Delhi" |
| **`/partnership/`** | Official OEM authorisations and verified ISO certification badges. | Procurement Managers, Tender Auditors, Vendor Vetting | "Request Partner Scope" | Microsoft Reseller, AWS Consulting, Google Cloud, Adobe, VMware, ISO 9001/27001/20000/45001/14001 details | "Authorized Microsoft partner Delhi", "ISO 27001 IT services Delhi" |
| **`/contact/`** | Multi-channel enterprise inquiry, RFP scope intake, and location details. | High-intent enterprise leads, RFP issuers | "Submit RFP Inquiry" | Interactive Zod-validated RFP Form, Direct Phone/Email, WhatsApp direct connect, Demo Business Park Office Map | "Contact Siddiona Technologies", "IT consulting inquiry Delhi" |

---

### 2.2 Core Service Catalog Routes (`/service/*`)

| Route | Sub-Services Covered | Target Audience | Primary CTA | SEO Focus |
| :--- | :--- | :--- | :--- | :--- |
| **`/service/`** (Hub) | Comprehensive directory of all 6 service domains. | CTOs, IT Managers | "View Service Details" | "IT services catalog India" |
| **`/service/managed-it-service/`** | IT Infra AMC, Facility Management (FMS), 24/7/365 Remote NOC, Master MSP, Co-Managed IT. | IT Directors, Facilities Heads | "Request AMC Proposal" | "Managed IT services Delhi", "24/7 NOC monitoring India", "IT AMC services" |
| **`/service/it-consultancy-service/`** | Technology Roadmapping, SOA Architecture, IT Project Management, Vulnerability & Security Audits. | CTOs, VPs of Engineering | "Book Architecture Review" | "Enterprise IT consulting Delhi", "IT security assessment India" |
| **`/service/enterprise-solution/`** | Hyperconverged Data Center Infra, Enterprise Campus Networking, Hardware Warranty Management, Staffing. | Enterprise Infrastructure Heads | "Scope Infrastructure" | "Data center solutions Delhi", "Enterprise networking solutions" |
| **`/service/application-service/`** | Custom Web & Mobile Apps, EAI & Middleware Integration, Cloud Refactoring, Application AMS Support. | Product Heads, Software Directors | "Discuss App Project" | "Custom enterprise application development", "Legacy app modernization" |
| **`/service/cloud-solutions/`** | AWS, Azure, GCP Deployments, M365 / Workspace, Zero-Downtime Cloud Migration, DRaaS Backup, FinOps. | Cloud Architects, DevOps Leads | "Request Cloud Audit" | "Cloud migration services India", "AWS Azure consulting partner Delhi" |
| **`/service/sap-consulting-services/`** | S/4HANA Migration, SAP AMS 24/7 Support, Multi-Location SAP Rollouts, Custom ABAP/Fiori Dev. | ERP Directors, CFOs, Operations Heads | "Consult SAP Specialist" | "SAP S4HANA migration consulting India", "SAP AMS support services" |
| **`/service/why-siddiona-technologies/`** | 6 Core Differentiators, 92% Client Retention, 90% Team Retention, SLA Commitments. | Procurement Committees, Diligence Officers | "Start Engagement" | "Why choose Siddiona Technologies", "Enterprise IT SLA guarantees" |

---

### 2.3 Smart Infrastructure & ELV Solutions (`/solutions/*`)

| Route | Solution Domain | Target Facility / Use Case | Primary CTA |
| :--- | :--- | :--- | :--- |
| **`/solutions/`** (Hub) | 12 Specialized Smart Building & Physical IT Domains | Infrastructure Heads | "Explore Solutions" |
| **`/solutions/room-automation/`** | Smart Boardroom & Meeting Room Automation | Corporate Offices | "Request Demo" |
| **`/solutions/surveillance-camera/`** | Enterprise IP CCTV, AI Video Analytics & ANPR | Industrial & Corporate | "Scope CCTV System" |
| **`/solutions/public-address-system/`** | IP Paging & Commercial Voice Evacuation | Campuses, Malls, Offices | "Request PA Design" |
| **`/solutions/access-control-system/`** | Biometric, RFID, Facial Recognition & Turnstiles | High-Security Facilities | "Upgrade Access Security" |
| **`/solutions/water-detection-system/`** | Server Room & Data Center Water Leak Cables | Server Rooms, Data Centers | "Protect Data Center" |
| **`/solutions/data-voice-networking/`** | Cat6A/Fiber Cabling, Racks, Wi-Fi 6/7 Networking | Enterprise Campuses | "Get Cabling Quote" |
| **`/solutions/telecom-network/`** | IP-PBX, SIP Trunking & Unified Communications | Call Centers & Offices | "Modernize Telecom" |
| **`/solutions/video-conferencing/`** | Teams/Zoom Rooms, Polycom/Logitech Hardware | Executive Boardrooms | "Design AV Setup" |
| **`/solutions/fire-detection/`** | Addressable Fire Alarms & Smoke Detection | Commercial Real Estate | "Audit Fire Safety" |
| **`/solutions/rodent-repellent/`** | Ultrasonic Rodent Repellers for Server Rooms | Data Centers & Server Racks | "Install Deterrent" |
| **`/solutions/bms-scada/`** | Building Management Systems & SCADA Dashboards | Smart Commercial Buildings | "Implement BMS" |
| **`/solutions/ups/`** | Online Double-Conversion Industrial UPS Systems | Mission-Critical IT Facilities| "Size UPS System" |

---

### 2.4 Career Portal & Legal Routes

| Route | Purpose | Interaction |
| :--- | :--- | :--- |
| **`/career/`** | Employer branding, company culture, employee benefits, active openings directory. | Filter by department (Engineering, Sales, IT Support, Project Management). |
| **`/career/[slug]/`** | Detailed role specifications, mandatory skills, location, CTC range. | Direct frictionless application with resume upload (PDF/DOCX) stored in Supabase. |
| **`/privacy-policy/`** | Standard Indian IT Act & global data protection policy disclosures. | Informational. |
| **`/terms-of-service/`** | Service terms, SLA governance, and commercial liability limits. | Informational. |
# Homepage and Who We Are Route Update — 2026-09-11

- **Homepage (`/`):** Hero → concise Company Overview → Authorized OEM & Cloud Ecosystem → Executive Leadership → global Footer.
- **Who We Are (`/about`):** Company Establishment & Background → `We Build Any Kind of Technology` practice directory → Our Mission → Our Vision → global Footer.
- Detailed practice, Mission, and Vision content belongs exclusively to `/about`; homepage navigation must not target removed `/#who-we-are`, `/#mission`, or `/#vision` anchors.
- Canonical anchors are `/about#who-we-are`, `/about#technology-capabilities`, `/about#mission`, and `/about#vision`.

---

---

## Careers route naming - superseded 2026-09-16

The `/career/` and `/career/[slug]/` paths described in this document were
never built under those names. The hiring platform ships at `/careers` and
`/careers/[slug]`, with permanent redirects from the singular form.

The scope also grew beyond what is described here. The implemented feature is
authenticated end to end: Supabase Auth with Google OAuth and email/password,
candidate profiles, an application status timeline, a protected admin console
for job and application management, private resume storage, and transactional
email. Read `docs/architecture.md` under "Careers Platform Architecture" and
`docs/careers-setup.md` for the current state.
