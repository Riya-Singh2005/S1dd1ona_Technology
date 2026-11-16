-- =====================================================================
-- Siddiona Careers - 0005 seed roles
--
-- Four published roles drawn from Siddiona's actual service taxonomy in
-- src/lib/navigation.ts, so the careers page has real, coherent content
-- the moment it goes live.
--
-- Salary ranges are deliberately left null. DESIGN.md forbids invented
-- claims, and the JobPosting structured data omits the field entirely
-- rather than publishing a made-up figure to Google Jobs. Add real
-- ranges from the admin console when they are agreed.
--
-- Re-running this file refreshes the seeded rows without disturbing any
-- role created through the admin console.
-- =====================================================================

insert into public.jobs (
  title, slug, department, location, work_mode, employment_type, experience,
  short_description, description,
  responsibilities, requirements, nice_to_have, what_you_will_work_on, benefits,
  hiring_process, status, published_at
) values
(
  'Senior Full Stack Developer',
  'senior-full-stack-developer',
  'Technology',
  'New Delhi',
  'hybrid',
  'full_time',
  '2-5 years',
  'Build the applications that carry our clients'' daily operations, from internal platforms to customer-facing systems.',
  'You will work inside our Application Services practice, designing and shipping web applications for enterprise clients across manufacturing, finance and public infrastructure. These are systems people use every day to do their jobs, so correctness, clarity and uptime matter more than novelty. You will own features end to end, from the first conversation with a stakeholder through to production support.',
  array[
    'Design, build and maintain web applications across the full stack, with real ownership of the features you ship',
    'Translate business requirements into technical designs, and push back when a requirement does not hold together',
    'Write and review code that the next engineer can read without a walkthrough',
    'Integrate applications with enterprise systems including SAP, Microsoft 365 and internal APIs',
    'Support what you build in production and improve it based on what you learn there'
  ],
  array[
    '2 to 5 years building production web applications',
    'Strong JavaScript or TypeScript, with depth in a modern framework such as React or Next.js',
    'Working knowledge of a server-side language and relational database design',
    'Comfortable with Git, code review and a CI pipeline',
    'Able to explain a technical tradeoff to someone who does not write code'
  ],
  array[
    'Experience integrating with SAP or other ERP systems',
    'Exposure to Azure or AWS in a production setting',
    'Background in infrastructure or DevOps work',
    'Experience in a client-facing or consulting role'
  ],
  array[
    'Internal platforms that our consulting and managed services teams rely on daily',
    'Client-facing enterprise applications with real operational load behind them',
    'Integration layers connecting ERP, identity and line-of-business systems',
    'Technical discovery alongside our architecture and advisory practice'
  ],
  array[
    'Health insurance for you and your immediate family',
    'A dedicated annual budget for certifications and training',
    'Hybrid working from our demo office',
    'Direct access to senior architects and the client conversations that shape the work'
  ],
  '[
    {"title": "Application review", "description": "We read every application ourselves. You will hear from us either way."},
    {"title": "Introductory call", "description": "A 30 minute conversation about your work, and an honest description of ours."},
    {"title": "Technical discussion", "description": "We walk through a problem together. No whiteboard algorithms, no trick questions."},
    {"title": "Practice conversation", "description": "Meet the engineers and consultants you would be working alongside."},
    {"title": "Offer", "description": "A written offer with the full compensation picture laid out."}
  ]'::jsonb,
  'published',
  now() - interval '9 days'
),
(
  'SAP S/4HANA Functional Consultant',
  'sap-s4hana-functional-consultant',
  'SAP Practice',
  'New Delhi',
  'onsite',
  'full_time',
  '4-8 years',
  'Guide enterprise clients through S/4HANA migration, implementation and rollout as part of our SAP consultancy practice.',
  'Our SAP practice takes clients from discovery through to steady-state application management. As a functional consultant you sit between the business and the system, working out what an organisation actually needs before anyone configures anything. The work is client-facing, it involves genuine complexity, and the decisions you make stay with the client for years.',
  array[
    'Run discovery and fit-gap analysis with client business teams',
    'Configure SAP modules to match agreed business processes',
    'Lead migration and rollout workstreams, including cutover planning',
    'Write functional specifications for technical development and test the result',
    'Support clients through go-live and into application management'
  ],
  array[
    '4 to 8 years of SAP functional consulting experience',
    'Hands-on configuration experience in at least one core module',
    'Direct involvement in a full implementation or migration lifecycle',
    'Confident running a workshop with senior client stakeholders',
    'Clear written communication, because your specifications become someone else''s build'
  ],
  array[
    'S/4HANA migration experience specifically, as opposed to ECC only',
    'SAP certification in your primary module',
    'Cross-module exposure',
    'Experience with SAP Activate methodology'
  ],
  array[
    'Greenfield and brownfield S/4HANA programmes',
    'Discovery engagements that set the direction for multi-year transformations',
    'Application management for clients already live on SAP',
    'Process design work alongside our business consulting practice'
  ],
  array[
    'Health insurance for you and your immediate family',
    'Funded SAP certification and module training',
    'Exposure to full transformation programmes rather than isolated tickets',
    'Structured progression within the SAP practice'
  ],
  '[
    {"title": "Application review", "description": "We read every application ourselves. You will hear from us either way."},
    {"title": "Introductory call", "description": "A 30 minute conversation about your module depth and the programmes you have worked on."},
    {"title": "Functional discussion", "description": "A working session with our SAP practice lead on a real scenario."},
    {"title": "Client-readiness conversation", "description": "How you handle stakeholders, scope and the awkward parts of a rollout."},
    {"title": "Offer", "description": "A written offer with the full compensation picture laid out."}
  ]'::jsonb,
  'published',
  now() - interval '6 days'
),
(
  'Cloud Infrastructure Engineer',
  'cloud-infrastructure-engineer',
  'Cloud',
  'New Delhi',
  'hybrid',
  'full_time',
  '3-6 years',
  'Design, migrate and operate the cloud infrastructure our clients run their businesses on.',
  'Our cloud practice handles migration, productivity, recovery, security and day-two operations. You will be responsible for infrastructure that has to stay up, for organisations where downtime has a number attached to it. That means careful design, real runbooks and a bias toward boring, well-understood technology.',
  array[
    'Design and implement cloud infrastructure across Azure and AWS',
    'Plan and execute migrations from on-premise and hybrid estates',
    'Build and maintain infrastructure-as-code and deployment automation',
    'Implement backup, disaster recovery and business continuity arrangements',
    'Operate production environments, including on-call rotation for critical clients'
  ],
  array[
    '3 to 6 years working with cloud infrastructure in production',
    'Solid grounding in networking, identity and Linux or Windows Server administration',
    'Practical infrastructure-as-code experience, for example Terraform or Bicep',
    'Understanding of cloud security and compliance controls',
    'Calm and methodical during an incident'
  ],
  array[
    'Azure or AWS professional-level certification',
    'Kubernetes or container platform experience',
    'VMware or hyperconverged infrastructure background',
    'Experience in a managed services or MSP environment'
  ],
  array[
    'Migration programmes moving entire estates into Azure and AWS',
    'Disaster recovery designs for clients with genuine continuity requirements',
    'Automation that replaces manual runbooks with repeatable pipelines',
    'The shared platform our managed services team monitors around the clock'
  ],
  array[
    'Health insurance for you and your immediate family',
    'Funded cloud certification, including exam costs and retakes',
    'Hybrid working with on-call compensated separately',
    'Access to real enterprise estates rather than sandbox environments'
  ],
  '[
    {"title": "Application review", "description": "We read every application ourselves. You will hear from us either way."},
    {"title": "Introductory call", "description": "A 30 minute conversation about the environments you have run."},
    {"title": "Technical discussion", "description": "We work through an architecture and an incident scenario together."},
    {"title": "Operations conversation", "description": "Meet the managed services team you would share the pager with."},
    {"title": "Offer", "description": "A written offer with the full compensation picture laid out."}
  ]'::jsonb,
  'published',
  now() - interval '3 days'
),
(
  'Enterprise Solutions Project Manager',
  'enterprise-solutions-project-manager',
  'Enterprise Solutions',
  'New Delhi',
  'onsite',
  'full_time',
  '5-9 years',
  'Own the delivery of integrated infrastructure programmes, from data centre build-outs to smart building automation.',
  'Enterprise Solutions delivers physical and digital infrastructure together: data centre and virtualisation, structured cabling and networking, AV and boardroom systems, physical security, power continuity and building automation. As project manager you hold the whole programme, coordinating engineers, OEM partners and client stakeholders through to handover.',
  array[
    'Own delivery for integrated infrastructure programmes end to end',
    'Plan schedule, budget, resourcing and risk, and keep all four honest',
    'Coordinate internal engineering teams, OEM partners and client facilities teams',
    'Run governance with client stakeholders, including the difficult status updates',
    'Drive commissioning, handover and documentation to a real close'
  ],
  array[
    '5 to 9 years managing infrastructure or systems integration projects',
    'Track record delivering multi-vendor programmes on site',
    'Fluent with project planning, risk registers and commercial change control',
    'Comfortable in both a server room and a boardroom',
    'Able to hold a schedule without losing the team'
  ],
  array[
    'PMP, PRINCE2 or an equivalent certification',
    'Data centre, ELV or building management systems background',
    'Experience with OEM partner ecosystems',
    'An engineering or technical foundation'
  ],
  array[
    'Data centre and virtualisation build-outs',
    'Campus networking, structured cabling and Wi-Fi programmes',
    'Smart boardroom, physical security and building automation deployments',
    'Multi-site rollouts for enterprise and public sector clients'
  ],
  array[
    'Health insurance for you and your immediate family',
    'Funded project management certification',
    'Ownership of complete programmes rather than isolated workstreams',
    'Direct working relationships with our OEM partners'
  ],
  '[
    {"title": "Application review", "description": "We read every application ourselves. You will hear from us either way."},
    {"title": "Introductory call", "description": "A 30 minute conversation about the programmes you have delivered."},
    {"title": "Delivery discussion", "description": "We work through a programme scenario, including what you would do when it slips."},
    {"title": "Stakeholder conversation", "description": "Meet the engineering leads and the practice head."},
    {"title": "Offer", "description": "A written offer with the full compensation picture laid out."}
  ]'::jsonb,
  'published',
  now() - interval '1 day'
)
on conflict (slug) do update
  set title                 = excluded.title,
      department            = excluded.department,
      location              = excluded.location,
      work_mode             = excluded.work_mode,
      employment_type       = excluded.employment_type,
      experience            = excluded.experience,
      short_description     = excluded.short_description,
      description           = excluded.description,
      responsibilities      = excluded.responsibilities,
      requirements          = excluded.requirements,
      nice_to_have          = excluded.nice_to_have,
      what_you_will_work_on = excluded.what_you_will_work_on,
      benefits              = excluded.benefits,
      hiring_process        = excluded.hiring_process,
      updated_at            = now();
