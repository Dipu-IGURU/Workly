// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV;

// Mock data for preview environment
export const mockJobs = [
  {
    _id: "688479cf328c4f3aaf26c98b",
    title: "C Developer", 
    company: "Google",
    location: "Bhopal",
    type: "Full-time",
    status: "active" as const,
    createdAt: "2025-07-26T06:46:39.323Z",
    description: "Aa ja bhai mast Life hai google 😁",
    requirements: ["Hiiii Gen-G"],
    postedBy: "6880b83a921561e3f7f0c0aa",
    applicants: []
  },
  {
    _id: "688479cf328c4f3aaf26c98c",
    title: "React Developer",
    company: "I-GURU", 
    location: "Remote",
    type: "Full-time",
    status: "active" as const,
    createdAt: "2025-07-25T06:46:39.323Z",
    description: "Looking for an experienced React developer to join our team",
    requirements: ["3+ years React experience", "TypeScript", "Redux"],
    postedBy: "6880b83a921561e3f7f0c0aa",
    applicants: [
      { _id: "app1", user: "user1", appliedAt: "2025-07-26T08:00:00.000Z" },
      { _id: "app2", user: "user2", appliedAt: "2025-07-26T09:00:00.000Z" }
    ]
  }
];

export const mockApplications = [
  {
    _id: "app1",
    jobId: "688479cf328c4f3aaf26c98c",
    jobTitle: "React Developer",
    applicant: {
      _id: "user1",
      firstName: "John",
      lastName: "Doe", 
      email: "john@example.com"
    },
    appliedAt: "2025-07-26T08:00:00.000Z",
    status: "pending" as const
  },
  {
    _id: "app2", 
    jobId: "688479cf328c4f3aaf26c98c",
    jobTitle: "React Developer",
    applicant: {
      _id: "user2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com"
    },
    appliedAt: "2025-07-26T09:00:00.000Z", 
    status: "reviewed" as const
  },
  {
    _id: "app3", 
    jobId: "688479cf328c4f3aaf26c98b",
    jobTitle: "C Developer",
    applicant: {
      _id: "user3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@example.com"
    },
    appliedAt: "2025-07-26T10:00:00.000Z", 
    status: "interview" as const
  },
  {
    _id: "app4", 
    jobId: "688479cf328c4f3aaf26c98b",
    jobTitle: "C Developer",
    applicant: {
      _id: "user4",
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah@example.com"
    },
    appliedAt: "2025-07-26T11:00:00.000Z", 
    status: "hired" as const
  },
  {
    _id: "app5", 
    jobId: "688479cf328c4f3aaf26c98c",
    jobTitle: "React Developer",
    applicant: {
      _id: "user5",
      firstName: "Tom",
      lastName: "Brown",
      email: "tom@example.com"
    },
    appliedAt: "2025-07-26T12:00:00.000Z", 
    status: "rejected" as const
  }
];