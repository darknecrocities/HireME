import { useState, useCallback } from 'react';

const SAVED_JOBS_KEY = 'hireme_saved_jobs';

export interface Job {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  remote: boolean;
  posted_at: string;
  url: string;
  platform: string;
  technologies?: string[];
}

// Local mock database containing diverse, high-fidelity job nodes
const mockJobs: Job[] = [
  {
    id: 'local-job-1',
    job_title: 'React & AI Full-Stack Developer',
    company_name: 'Antigravity Labs',
    location: 'Remote',
    remote: true,
    posted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hrs ago
    url: 'https://antigravity.dev',
    platform: 'HireME Hub',
    technologies: ['React', 'Ollama', 'TypeScript', 'Tailwind', 'Node.js']
  },
  {
    id: 'local-job-2',
    job_title: 'Local LLM DevOps Engineer',
    company_name: 'DomoDomo Corp',
    location: 'Singapore',
    remote: true,
    posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    url: 'https://domodomo.site',
    platform: 'HireME Hub',
    technologies: ['Ollama', 'Docker', 'Kubernetes', 'Python', 'Go']
  },
  {
    id: 'local-job-3',
    job_title: 'NLP Research Specialist',
    company_name: 'AI Resonance Systems',
    location: 'Manila, PH',
    remote: false,
    posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://resonance-ai.net',
    platform: 'Direct Hire',
    technologies: ['PyTorch', 'HuggingFace', 'Llama', 'FastAPI', 'Python']
  },
  {
    id: 'local-job-4',
    job_title: 'Senior Frontend Architect',
    company_name: 'Vercel Labs',
    location: 'Remote',
    remote: true,
    posted_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    url: 'https://vercel.com',
    platform: 'Next Career',
    technologies: ['React', 'Next.js', 'TypeScript', 'CSS', 'Vite']
  },
  {
    id: 'local-job-5',
    job_title: 'Go Backend Developer',
    company_name: 'Stripe',
    location: 'Singapore',
    remote: false,
    posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://stripe.com',
    platform: 'Stripe Careers',
    technologies: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'gRPC']
  },
  {
    id: 'local-job-6',
    job_title: 'Cybersecurity Analyst',
    company_name: 'CyberShield Sec',
    location: 'Tokyo, JP',
    remote: false,
    posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://cybershield.io',
    platform: 'Security Jobs',
    technologies: ['Linux', 'Wireshark', 'Python', 'Penetration Testing']
  },
  {
    id: 'local-job-7',
    job_title: 'Mobile Flutter Engineer',
    company_name: 'Nomad Apps',
    location: 'Remote',
    remote: true,
    posted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: 'https://nomadapps.co',
    platform: 'Nomad Portal',
    technologies: ['Flutter', 'Dart', 'iOS', 'Android', 'Firebase']
  },
  {
    id: 'local-job-8',
    job_title: 'UI/UX Developer',
    company_name: 'Figma Studio',
    location: 'San Francisco, US',
    remote: true,
    posted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://figma.com',
    platform: 'Design Board',
    technologies: ['Figma', 'CSS', 'React', 'HTML', 'Framer Motion']
  },
  {
    id: 'local-job-9',
    job_title: 'Database Administrator',
    company_name: 'Oracle Data',
    location: 'Sydney, AU',
    remote: false,
    posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://oracle.com',
    platform: 'Oracle Careers',
    technologies: ['Oracle DB', 'SQL', 'Linux', 'Performance Tuning']
  },
  {
    id: 'local-job-10',
    job_title: 'Embedded Systems Engineer',
    company_name: 'Tesla Energy',
    location: 'Austin, US',
    remote: false,
    posted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://tesla.com',
    platform: 'Tesla Board',
    technologies: ['C++', 'C', 'RTOS', 'Microcontrollers', 'Embedded Linux']
  },
  {
    id: 'local-job-11',
    job_title: 'Full-Stack Node/Vue Engineer',
    company_name: 'Basecamp',
    location: 'Remote',
    remote: true,
    posted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    url: 'https://basecamp.com',
    platform: 'Basecamp Hub',
    technologies: ['Vue.js', 'Node.js', 'Express', 'MongoDB', 'CSS']
  },
  {
    id: 'local-job-12',
    job_title: 'Cloud Architect (AWS)',
    company_name: 'CloudNative Inc',
    location: 'London, UK',
    remote: true,
    posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://cloudnative.net',
    platform: 'Cloud Board',
    technologies: ['AWS', 'Terraform', 'Kubernetes', 'CloudFormation']
  },
  {
    id: 'local-job-13',
    job_title: 'Product Manager (AI Tools)',
    company_name: 'OpenAI Labs',
    location: 'Remote',
    remote: true,
    posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://openai.com',
    platform: 'OpenAI Careers',
    technologies: ['Product Strategy', 'LLM Architectures', 'Agile', 'Roadmapping']
  },
  {
    id: 'local-job-14',
    job_title: 'iOS Swift Developer',
    company_name: 'Apple Services',
    location: 'Cupertino, US',
    remote: false,
    posted_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://apple.com',
    platform: 'Apple Careers',
    technologies: ['Swift', 'SwiftUI', 'Xcode', 'CoreData', 'Combine']
  },
  {
    id: 'local-job-15',
    job_title: 'Machine Learning Operations (MLOps)',
    company_name: 'RunPod',
    location: 'Remote',
    remote: true,
    posted_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    url: 'https://runpod.io',
    platform: 'GPU Board',
    technologies: ['Python', 'Docker', 'CUDA', 'Kubernetes', 'PyTorch']
  }
];

export function useJobSearch() {
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [limitReached] = useState(false);

  const searchJobs = useCallback(async (filters: { 
    query?: string; 
    location?: string; 
    remote?: boolean;
    posted_at_max_age_days?: number;
  }) => {
    setLoading(true);

    // Simulate small client-side delay for network consistency feel
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockJobs];

    // Filter by query (title or technologies)
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      filtered = filtered.filter(job => 
        job.job_title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        (job.technologies && job.technologies.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Filter by location
    if (filters.location) {
      const loc = filters.location.toLowerCase().trim();
      filtered = filtered.filter(job => job.location.toLowerCase().includes(loc));
    }

    // Filter by remote status
    if (typeof filters.remote === 'boolean') {
      filtered = filtered.filter(job => job.remote === filters.remote);
    }

    setLoading(false);
    return filtered;
  }, []);

  const saveJob = async (job: Job) => {
    try {
      const savedJobs = await getSavedJobs();
      if (savedJobs.some((j: Job) => String(j.id) === String(job.id))) return;
      
      const newSaved = [
        {
          id: String(job.id),
          job_title: job.job_title || 'Unknown Role',
          company_name: job.company_name || 'Hidden Company',
          location: job.location || 'Remote/Global',
          remote: !!job.remote,
          posted_at: job.posted_at || new Date().toISOString(),
          url: job.url || '#',
          platform: job.platform || 'General',
          technologies: job.technologies || []
        },
        ...savedJobs
      ];
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(newSaved));
      // Dispatch custom event to notify listeners of saved jobs change
      window.dispatchEvent(new Event('hireme_saved_jobs_updated'));
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const getSavedJobs = async (): Promise<Job[]> => {
    try {
      const data = localStorage.getItem(SAVED_JOBS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      return [];
    }
  };

  const unsaveJob = async (jobId: string) => {
    try {
      const savedJobs = await getSavedJobs();
      const filtered = savedJobs.filter((j: Job) => String(j.id) !== String(jobId));
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event('hireme_saved_jobs_updated'));
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  return { searchJobs, saveJob, getSavedJobs, unsaveJob, loading, error, limitReached };
}
