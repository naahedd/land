export interface Resume {
    id: string;
    user_id: string;
    original_filename: string;
    file_url: string;
    file_size: number;
    uploaded_at: string;
    created_at: string;
  }
  
  export interface EmphasisArea {
    name: string;
    level: number; // 0-5 (0 = not emphasized)
    apply_to: ('projects' | 'experience')[]; // Which sections to apply to
  }
  
  export interface ResumeVersion {
    id: string;
    resume_id: string;
    version_name: string;
    company_name: string;
    job_title: string;
    job_description?: string;
    custom_requirements?: string;
    is_default: boolean;
    emphasis_areas: EmphasisArea[]; // Add this
    created_at: string;
    updated_at: string;
  }
  
  export interface ResumeFeedback {
    id: string;
    version_id: string;
    feedback_type: 'recruiter_letter' | 'project_suggestions' | 'experience_tweaks'
    content: string;
    generated_at: string;
  }