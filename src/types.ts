export interface Project {
  id: string;
  title: string;
  category: "Systems" | "Theory/Math" | "Web Apps";
  tags: string[];
  description: string;
  details: string[];
  tech: string[];
  github?: string;
  impact?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  doi?: string;
  arxiv?: string;
  link?: string;
  description: string;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  type: "Teaching" | "Research" | "Leadership";
  bullets: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  location: string;
  degree: string;
  period: string;
  gpa?: string;
  details?: string[];
}

export interface Certification {
  name: string;
  provider?: string;
  date?: string;
  link?: string;
}
