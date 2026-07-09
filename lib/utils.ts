import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLATFORM_DOMAINS: Record<string, string> = {
  "LinkedIn": "linkedin.com",
  "Indeed": "indeed.com",
  "Glassdoor": "glassdoor.com",
  "Wellfound": "wellfound.com",
  "Y Combinator": "ycombinator.com",
  "Otta": "otta.com",
  "ZipRecruiter": "ziprecruiter.com",
  "Handshake": "joinhandshake.com",
  "Built In": "builtin.com",
  "Naukri": "naukri.com",
  "Instahyre": "instahyre.com",
  "Cutshort": "cutshort.io",
  "Hirect": "hirect.in",
  "Foundit": "foundit.in",
  "Hirist": "hirist.tech",
  "We Work Remotely": "weworkremotely.com",
  "FlexJobs": "flexjobs.com",
  "Upwork": "upwork.com",
  "Toptal": "toptal.com",
  "Greenhouse": "greenhouse.io",
  "Lever": "lever.co",
  "Workday": "workday.com",
  "Ashby": "ashbyhq.com",
  "BambooHR": "bamboohr.com",
  "Dice": "dice.com",
  "Monster": "monster.com",
  "SimplyHired": "simplyhired.com",
  "Behance": "behance.net",
  "Dribbble": "dribbble.com",
};

export const getPlatformIcon = (platform?: string | null) => {
  if (!platform) return null;
  
  const p = platform.trim();

  // Try exact match first
  if (PLATFORM_DOMAINS[p]) {
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${PLATFORM_DOMAINS[p]}&size=64`;
  }

  // Try case-insensitive match
  const found = Object.keys(PLATFORM_DOMAINS).find(k => k.toLowerCase() === p.toLowerCase());
  if (found) {
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${PLATFORM_DOMAINS[found]}&size=64`;
  }

  // Fallback: guess domain based on name
  const cleanName = p.toLowerCase().replace(/[^a-z0-9.]/g, '');
  if (cleanName.length >= 2) {
    const domain = cleanName.includes('.') ? cleanName : `${cleanName}.com`;
    return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=64`;
  }

  return null;
};
