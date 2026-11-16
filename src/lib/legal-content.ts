/**
 * Legal document content model.
 *
 * Privacy Policy and Terms of Service share one structure so both routes render
 * through `LegalDocument`. Content lives here as data, keeping the page and
 * section components free of prose and easy to re-style.
 */

export type LegalBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "definitions"; items: { term: string; text: string }[] }
  | { kind: "callout"; title: string; text: string };

export interface LegalSection {
  /** Anchor target, also used by the table of contents. */
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalContactChannel {
  label: string;
  value: string;
  href?: string;
}

export interface LegalDocumentContent {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
  contact: {
    title: string;
    description: string;
    channels: LegalContactChannel[];
  };
}

const LEGAL_ENTITY = "Siddiona Technologies Services Pvt. Ltd.";

const SHARED_CONTACT_CHANNELS: LegalContactChannel[] = [
  { label: "HR email", value: "hr@example.com", href: "mailto:hr@example.com" },
  { label: "Technical email", value: "tech@example.com", href: "mailto:tech@example.com" },
  { label: "Phone", value: "+91-00000-00000", href: "tel:+910000000000" },
  { label: "Registered address", value: "123 Demo Business Park, New Delhi, India" },
];

export const PRIVACY_POLICY: LegalDocumentContent = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  summary:
    "What we collect, how we protect your personal data and your CV, and how to have it deleted.",
  effectiveDate: "16 September 2026",
  lastUpdated: "2 October 2026",
  intro: [
    `${LEGAL_ENTITY} runs siddiona.com. This covers visitors, enquiries, and job applicants.`,
  ],
  sections: [
    {
      id: "what-we-collect",
      title: "1. What we collect",
      blocks: [
        {
          kind: "list",
          items: [
            "Enquiries: your name, email, phone, company, and message.",
            "Google sign-in: your name, email, and profile picture. Never your password, and no access to Gmail or Drive.",
            "Applications: your CV, contact details, cover note, and the role you applied for.",
            "Site data: IP address, browser, pages visited, referral source, and campaign parameters. Cookies and local storage keep you signed in and retain first- and latest-touch attribution for up to 90 days.",
          ],
        },
        {
          kind: "callout",
          title: "Never send us these",
          text: "Bank or card details, passwords, or government ID numbers. We never ask for them here.",
        },
      ],
    },
    {
      id: "how-we-use-it",
      title: "2. How we use it",
      blocks: [
        {
          kind: "list",
          items: [
            "Replying to your enquiry.",
            "Running and securing your careers account.",
            "Reviewing your application and arranging interviews.",
            "Keeping the site secure and meeting our legal obligations.",
            "Measuring website traffic and campaign performance through Google Analytics 4, and associating campaign attribution with enquiries and job applications.",
          ],
        },
        {
          kind: "paragraph",
          text: "No advertising, and no automated shortlisting — our hiring team decides.",
        },
        {
          kind: "callout",
          title: "Current analytics setting",
          text: "Google Analytics currently loads when the site opens, without a consent banner. This is a product and privacy configuration choice, not a statement that the approach satisfies every law or jurisdiction.",
        },
      ],
    },
    {
      id: "your-cv",
      title: "3. Your CV",
      blocks: [
        {
          kind: "list",
          items: [
            "Stored encrypted, visible only to the hiring team for the role you applied for.",
            "Never shared with other employers or recruiters.",
            "Deleted after 12 months, or sooner if you ask.",
          ],
        },
      ],
    },
    {
      id: "security",
      title: "4. Security and sharing",
      blocks: [
        {
          kind: "list",
          items: [
            "Encrypted in transit and at rest; access limited to staff who need it.",
            "Shared only with the providers who host, authenticate, store, email, and measure use of our site, including Google Analytics, and with authorities where the law requires it.",
            "Never sold, rented, or traded.",
          ],
        },
      ],
    },
    {
      id: "your-choices",
      title: "5. Your choices",
      blocks: [
        {
          kind: "list",
          items: [
            "Ask what we hold, and ask us to correct or delete it.",
            "Withdraw consent, or disconnect Siddiona in your Google Account settings.",
            "Complain to us, then to the Data Protection Board of India.",
          ],
        },
        {
          kind: "paragraph",
          text: "Enquiries are kept up to 24 months and site logs up to 12 months. The site is for ages 18 and over. We may update this policy; the effective date above shows the current version.",
        },
      ],
    },
  ],
  contact: {
    title: "Contact us about your data",
    description: "Send privacy questions, deletion requests, or complaints to our Grievance Officer.",
    channels: SHARED_CONTACT_CHANNELS,
  },
};

export const TERMS_OF_SERVICE: LegalDocumentContent = {
  eyebrow: "Legal",
  title: "Terms of Service",
  summary: "Terms for using this site, signing in with Google, and applying for a job.",
  effectiveDate: "16 September 2026",
  lastUpdated: "16 September 2026",
  intro: [
    `These terms govern siddiona.com, operated by ${LEGAL_ENTITY}. Using the site means you accept them.`,
  ],
  sections: [
    {
      id: "using-the-site",
      title: "1. Using this site",
      blocks: [
        {
          kind: "list",
          items: [
            "Our content is information, not an offer, a quote, or advice. Client work runs on a signed agreement.",
            "You must be 18 or over to use the site.",
          ],
        },
      ],
    },
    {
      id: "your-account",
      title: "2. Your account",
      blocks: [
        {
          kind: "list",
          items: [
            "Applying needs an account. Sign-in is by Google, under Google's terms.",
            "Keep your details accurate and your Google account secure.",
            "You are responsible for activity under your account. Do not share it.",
            "We may suspend accounts that breach these terms or look fraudulent.",
          ],
        },
      ],
    },
    {
      id: "applications",
      title: "3. Job applications",
      blocks: [
        {
          kind: "list",
          items: [
            "What you submit must be true and yours to share. We may verify it.",
            "Applying creates no offer, and roles may change or be withdrawn.",
            "You keep your CV; we may store it and circulate it internally to assess your application.",
          ],
        },
        {
          kind: "callout",
          title: "Siddiona never charges candidates",
          text: "No fee at any stage, and we never ask for payment or bank details — directly or through an agent. Anyone who does is committing fraud. Report it to us.",
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable use",
      blocks: [
        {
          kind: "list",
          items: [
            "No unlawful, false, or malicious content.",
            "No unauthorised access or security testing without our written permission.",
            "No scraping, harvesting, or disrupting the site.",
            "Our content, name, and logo stay ours; keep extracts only for your own evaluation.",
          ],
        },
      ],
    },
    {
      id: "liability",
      title: "5. Liability and law",
      blocks: [
        {
          kind: "list",
          items: [
            "The site is provided “as is”. We may change or withdraw any part of it, including job listings.",
            "Third-party services such as Google sign-in and our hosting are outside our control.",
            "We are not liable for indirect loss, and our total liability is capped at INR 10,000, except where the law forbids a limit.",
            "We may revise these terms; the effective date above shows the current version.",
            "Indian law governs, and the courts at New Delhi have exclusive jurisdiction.",
          ],
        },
      ],
    },
  ],
  contact: {
    title: "Questions about these terms",
    description: "Ask us anything about these terms, or report recruitment fraud using Siddiona's name.",
    channels: SHARED_CONTACT_CHANNELS,
  },
};
