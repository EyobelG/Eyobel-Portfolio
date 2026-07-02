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

export interface Course {
  name: string;
  description: string;
  syllabus: string[];
  evaluations?: { metric: string; score: string }[];
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
  courses?: Course[];
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

export interface Museum {
  id: string;
  name: string;
  city: "Boston" | "New York" | "Los Angeles" | "San Francisco";
  description: string;
  x: number; // relative percentage 0-100 on city map
  y: number; // relative percentage 0-100 on city map
  lat: number;
  lng: number;
  visited: boolean;
  rating: number; // 1-5 stars
  personalNotes: string;
  highlightExhibits: string[];
  imageUrl: string;
  yearVisited?: string;
}

