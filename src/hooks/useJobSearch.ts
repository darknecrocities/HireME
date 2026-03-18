import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { db } from '../services/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  getDocs,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwYXJlamFzYXJyb25raWFuQGdtYWlsLmNvbSIsInBlcm1pc3Npb25zIjoidXNlciIsImNyZWF0ZWRfYXQiOiIyMDI2LTAzLTE4VDEwOjMyOjQ3LjEyMTAzMyswMDowMCJ9.joJnsOFEgLDODFd-thlR8COKh3Wd2q3tOE2kBq2pxqg';
const API_URL = 'https://api.theirstack.com/v1/jobs/search';

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

export function useJobSearch() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const checkAndIncrementLimit = async () => {
    if (!user) return true; // Guests handled by local usage hook potentially, but per userReq we check firebase

    const userUsageRef = doc(db, 'users', user.uid, 'usage', 'jobSearch');
    const docSnap = await getDoc(userUsageRef);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.lastReset === today) {
        if (data.count >=3) {
          setLimitReached(true);
          return false;
        }
        await updateDoc(userUsageRef, {
          count: data.count + 1
        });
      } else {
        await setDoc(userUsageRef, {
          count: 1,
          lastReset: today
        });
      }
    } else {
      await setDoc(userUsageRef, {
        count: 1,
        lastReset: today
      });
    }
    return true;
  };

  const searchJobs = useCallback(async (filters: { 
    query?: string; 
    location?: string; 
    remote?: boolean;
    posted_at_max_age_days?: number;
  }) => {
    if (!user) {
        setError('Please sign in to search for jobs.');
        return [];
    }

    setLoading(true);
    setError(null);

    try {
      const canSearch = await checkAndIncrementLimit();
      if (!canSearch) {
        setError('Daily search limit reached (3/day).');
        setLoading(false);
        return [];
      }

      const body: any = {
        limit: 3,
        posted_at_max_age_days: filters.posted_at_max_age_days || 30
      };

      if (filters.query) body.job_title_or = [filters.query];
      else body.job_title_or = ['Software Engineer']; 

      if (filters.location) body.location_or = [filters.location];
      if (typeof filters.remote === 'boolean') body.remote = filters.remote;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      return (data.data || []).map((job: any) => ({
        id: job.id,
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        remote: job.remote,
        posted_at: job.posted_at,
        url: job.url,
        platform: job.job_board || job.source || 'Direct',
        technologies: job.technologies || []
      }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveJob = async (job: Job) => {
    if (!user) return;
    try {
      const jobId = String(job.id);
      const userId = String(user.uid);
      const savedJobRef = doc(db, 'users', userId, 'savedJobs', jobId);
      
      // Sanitize data for Firestore (replace undefined with null/empty string)
      const sanitizedJob = {
        id: jobId,
        job_title: job.job_title || 'Unknown Role',
        company_name: job.company_name || 'Hidden Company',
        location: job.location || 'Global/Remote',
        remote: !!job.remote,
        posted_at: job.posted_at || new Date().toISOString(),
        url: job.url || '#',
        platform: job.platform || 'General',
        technologies: job.technologies || []
      };

      await setDoc(savedJobRef, {
        ...sanitizedJob,
        savedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const getSavedJobs = async () => {
    if (!user) return [];
    try {
      const q = query(collection(db, 'users', String(user.uid), 'savedJobs'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: String(doc.id), ...doc.data() } as Job & { savedAt: any }));
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      return [];
    }
  };

  const unsaveJob = async (jobId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', String(user.uid), 'savedJobs', String(jobId)));
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  return { searchJobs, saveJob, getSavedJobs, unsaveJob, loading, error, limitReached };
}
