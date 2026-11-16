/**
 * Typed contract for the Siddiona Careers Postgres schema.
 *
 * Hand-maintained to mirror `supabase/migrations/`. If you change a
 * migration, change this file in the same commit. Regenerating with
 * `supabase gen types typescript` is equivalent and will overwrite it.
 */

export type JobStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "changes_requested"
  | "closed";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "temporary";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type WorkMode = "onsite" | "hybrid" | "remote";

export type AdminRole = "super_admin" | "admin" | "recruiter";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** One step in a job's published hiring process. */
export type HiringProcessStep = {
  title: string;
  description: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  resume_path: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type JobRow = {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  work_mode: WorkMode | null;
  employment_type: EmploymentType;
  experience: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  short_description: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  what_you_will_work_on: string[];
  benefits: string[];
  hiring_process: HiringProcessStep[];
  status: JobStatus;
  published_at: string | null;
  closing_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ApplicationRow = {
  id: string;
  reference: string;
  job_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_path: string;
  cover_letter: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  additional_info: string | null;
  first_touch_attribution: Json | null;
  last_touch_attribution: Json | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
};

type ApplicationEventRow = {
  id: string;
  application_id: string;
  old_status: ApplicationStatus | null;
  new_status: ApplicationStatus;
  changed_by: string | null;
  created_at: string;
};

type ApplicationNoteRow = {
  id: string;
  application_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
};

type AdminUserRow = {
  user_id: string;
  role: AdminRole;
  created_at: string;
};

type JobApprovalStateRow = {
  job_id: string;
  submitted_by: string | null;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_reason: string | null;
  updated_at: string;
};

type EmailEventRow = {
  id: string;
  kind: string;
  to_email: string;
  application_id: string | null;
  status: "sent" | "failed" | "skipped";
  provider_id: string | null;
  error: string | null;
  created_at: string;
};

type Insertable<Row, Optional extends keyof Row> = Partial<Row> &
  Omit<Row, Optional>;

/**
 * postgrest-js requires a `Relationships` entry per table so it can type
 * embedded selects such as `job:jobs(...)`. Only the foreign keys the
 * application actually embeds across are declared.
 */
type NoRelationships = [];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Insertable<ProfileRow, Exclude<keyof ProfileRow, "id" | "email">>;
        Update: Partial<ProfileRow>;
        Relationships: NoRelationships;
      };
      jobs: {
        Row: JobRow;
        Insert: Insertable<
          JobRow,
          | "id"
          | "work_mode"
          | "employment_type"
          | "experience"
          | "salary_min"
          | "salary_max"
          | "currency"
          | "responsibilities"
          | "requirements"
          | "nice_to_have"
          | "what_you_will_work_on"
          | "benefits"
          | "hiring_process"
          | "status"
          | "published_at"
          | "closing_at"
          | "created_by"
          | "created_at"
          | "updated_at"
        >;
        Update: Partial<JobRow>;
        Relationships: NoRelationships;
      };
      applications: {
        Row: ApplicationRow;
        Insert: Insertable<
          ApplicationRow,
          | "id"
          | "reference"
          | "cover_letter"
          | "linkedin_url"
          | "portfolio_url"
          | "github_url"
          | "additional_info"
          | "first_touch_attribution"
          | "last_touch_attribution"
          | "status"
          | "created_at"
          | "updated_at"
        >;
        Update: Partial<ApplicationRow>;
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      application_events: {
        Row: ApplicationEventRow;
        Insert: Insertable<ApplicationEventRow, "id" | "old_status" | "changed_by" | "created_at">;
        Update: Partial<ApplicationEventRow>;
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_notes: {
        Row: ApplicationNoteRow;
        Insert: Insertable<ApplicationNoteRow, "id" | "created_at">;
        Update: Partial<ApplicationNoteRow>;
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: Insertable<AdminUserRow, "role" | "created_at">;
        Update: Partial<AdminUserRow>;
        Relationships: NoRelationships;
      };
      job_approval_state: {
        Row: JobApprovalStateRow;
        Insert: Insertable<
          JobApprovalStateRow,
          | "submitted_by"
          | "submitted_at"
          | "reviewed_by"
          | "reviewed_at"
          | "review_reason"
          | "updated_at"
        >;
        Update: Partial<JobApprovalStateRow>;
        Relationships: [
          {
            foreignKeyName: "job_approval_state_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: true;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      email_events: {
        Row: EmailEventRow;
        Insert: Insertable<EmailEventRow, "id" | "application_id" | "provider_id" | "error" | "created_at">;
        Update: Partial<EmailEventRow>;
        Relationships: NoRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      admin_management_list: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string | null };
        Returns: Json;
      };
      prepare_admin_invite: {
        Args: { p_email: string; p_full_name: string };
        Returns: Json;
      };
      cancel_admin_invite: {
        Args: { p_email: string };
        Returns: undefined;
      };
      revoke_admin_access: {
        Args: { p_target_user_id: string };
        Returns: boolean;
      };
      consume_rate_limit: {
        Args: { p_bucket: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
      admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      submit_job_for_approval: {
        Args: { p_job_id: string };
        Returns: JobStatus;
      };
      review_job_submission: {
        Args: { p_job_id: string; p_decision: string; p_reason?: string | null };
        Returns: JobStatus;
      };
      set_job_lifecycle: {
        Args: { p_job_id: string; p_status: JobStatus };
        Returns: JobStatus;
      };
      admin_candidate_summaries: {
        Args: { p_limit?: number; p_offset?: number };
        Returns: Json;
      };
    };
    Enums: {
      job_status: JobStatus;
      employment_type: EmploymentType;
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
