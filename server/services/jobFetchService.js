import axios from 'axios';
import { Job } from '../models/Job.model.js';

function normalizeAdzunaJob(job) {
  return {
    externalId: String(job.id),
    source: 'Adzuna',
    title: job.title || '',
    company: job.company?.display_name || '',
    location: job.location?.display_name || '',
    jobType: job.contract_time || '',
    description: job.description || '',
    salaryMin: job.salary_min || null,
    salaryMax: job.salary_max || null,
    currency: 'USD',
    skills: extractSkillsFromDescription(job.description || ''),
    applyUrl: job.redirect_url || job.adref || '',
    postedAt: job.created ? new Date(job.created) : null,
    expiresAt: null,
  };
}

function normalizeJSearchJob(job) {
  return {
    externalId: job.job_id || String(Date.now()),
    source: 'JSearch',
    title: job.job_title || '',
    company: job.employer_name || '',
    location: `${job.job_city || ''}, ${job.job_country || ''}`.trim().replace(/^,\s*/, ''),
    jobType: job.job_employment_type || '',
    description: job.job_description || '',
    salaryMin: job.job_min_salary || null,
    salaryMax: job.job_max_salary || null,
    currency: job.job_salary_currency || 'USD',
    skills: job.job_required_skills || extractSkillsFromDescription(job.job_description || ''),
    applyUrl: job.job_apply_link || '',
    postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : null,
    expiresAt: null,
  };
}

const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Spring',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP',
  'Docker', 'Kubernetes', 'CI/CD', 'Git', 'REST', 'GraphQL', 'Microservices',
  'HTML', 'CSS', 'Tailwind', 'Next.js', 'Nuxt', 'Flutter', 'React Native',
];

function extractSkillsFromDescription(description) {
  const found = [];
  const lower = description.toLowerCase();
  for (const skill of TECH_SKILLS) {
    if (lower.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  return found.slice(0, 15);
}

async function fetchFromAdzuna(preferences) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error('Adzuna API credentials not configured.');
  }

  const params = {
    app_id: appId,
    app_key: appKey,
    results_per_page: 50,
    what: preferences.desiredRole || 'software developer',
    content_type: 'application/json',
  };

  if (preferences.preferredLocations?.length > 0) {
    params.where = preferences.preferredLocations[0];
  }
  if (preferences.salaryMin && preferences.salaryMin > 0) {
    params.salary_min = preferences.salaryMin;
  }

  const country = 'us';
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;

  const response = await axios.get(url, { params, timeout: 10000 });
  return (response.data.results || []).map(normalizeAdzunaJob);
}

async function fetchFromJSearch(preferences) {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    throw new Error('JSearch API key not configured.');
  }

  const query = preferences.desiredRole || 'software developer';
  const location = preferences.preferredLocations?.[0] || 'United States';

  const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
    params: {
      query: `${query} in ${location}`,
      page: '1',
      num_pages: '1',
      date_posted: 'month',
    },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    timeout: 10000,
  });

  return (response.data.data || []).map(normalizeJSearchJob);
}

export async function fetchJobs(preferences) {
  let jobs = [];

  try {
    const adzunaJobs = await fetchFromAdzuna(preferences);
    jobs = [...jobs, ...adzunaJobs];
    console.log(`Fetched ${adzunaJobs.length} jobs from Adzuna`);
  } catch (err) {
    console.warn('Adzuna fetch failed:', err.message);
  }

  if (jobs.length < 10) {
    try {
      const jsearchJobs = await fetchFromJSearch(preferences);
      jobs = [...jobs, ...jsearchJobs];
      console.log(`Fetched ${jsearchJobs.length} jobs from JSearch`);
    } catch (err) {
      console.warn('JSearch fetch failed:', err.message);
    }
  }

  // Deduplicate by title + company
  const seen = new Set();
  const unique = jobs.filter((job) => {
    const key = `${job.title?.toLowerCase()}-${job.company?.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const limited = unique.slice(0, 100);

  // Upsert into DB
  const upserted = await Promise.all(
    limited.map((job) =>
      Job.findOneAndUpdate(
        { externalId: job.externalId, source: job.source },
        { $set: { ...job, fetchedAt: new Date() } },
        { upsert: true, new: true }
      )
    )
  );

  return upserted.filter(Boolean);
}
