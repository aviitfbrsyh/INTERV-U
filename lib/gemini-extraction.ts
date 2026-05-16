export interface CVData {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    responsibilities: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
  }[];
  certifications: string[];
}

export interface JDData {
  role: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
}

export async function extractCV(input: { text?: string; file?: { base64: string; mimeType: string } }): Promise<CVData> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'cv', input }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `CV extraction failed (${res.status})`);
  }
  return res.json();
}

export async function extractJD(textOrFile: { text?: string; file?: { base64: string; mimeType: string } }): Promise<JDData> {
  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'jd', input: textOrFile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `JD extraction failed (${res.status})`);
  }
  return res.json();
}
