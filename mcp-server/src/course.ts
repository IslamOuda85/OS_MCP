export interface Env {
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
  GITHUB_CONTENT_ROOT?: string;
}

export interface ChapterRow {
  number: number;
  title: string;
  folder: string;
  section_count: number;
  asset_count: number;
  content_sha256: string;
  content_status: string;
  open_issues: string;
}

export interface SectionRow {
  id: string;
  source_id: string;
  chapter: number;
  title: string;
  level: number;
  parent: string | null;
  children: string[];
  source: string;
  kind: string;
  asset_ids: string[];
  spans: Array<{ start: number; end: number }>;
  length: number;
  terms: Record<string, number>;
  preview: string;
}

export interface CourseIndex {
  schema_version: number;
  generated_at: string;
  method: string;
  chapters: ChapterRow[];
  sections: SectionRow[];
  document_frequency: Record<string, number>;
  average_length: number;
}

const STOPWORDS = new Set("a an and are as at be by can do does for from how in into is it of on or that the their these this to was were what when where which with you your".split(" "));
const ALIASES: Record<string, string> = {
  fcfs: "first come first served", sjf: "shortest job first", srtf: "shortest remaining time first",
  rr: "round robin", pcb: "process control block", tlb: "translation lookaside buffer",
  mmu: "memory management unit", ipc: "interprocess communication", numa: "nonuniform memory access",
  lru: "least recently used", fifo: "first in first out", cfs: "completely fair scheduler",
  cpu: "central processing unit", io: "input output", raid: "redundant array independent disks",
};
let indexCache: { key: string; expires: number; data: CourseIndex } | undefined;

export function tokens(value: string): string[] {
  return (value.toLowerCase().match(/[a-z0-9]+/g) || []).filter((term) => term.length > 1 && !STOPWORDS.has(term));
}

export function githubPath(env: Env, path: string, raw = true): string {
  const owner = env.GITHUB_OWNER?.trim();
  const repo = env.GITHUB_REPO?.trim();
  const branch = env.GITHUB_BRANCH?.trim() || "main";
  const root = (env.GITHUB_CONTENT_ROOT || "").replace(/^\/+|\/+$/g, "");
  if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) throw new Error("Invalid GitHub owner or repository configuration.");
  if (branch.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("Invalid GitHub branch configuration.");
  const segments = [...(root ? root.split("/") : []), ...path.split("/")];
  if (segments.some((part) => !part || part === "." || part === "..")) throw new Error("Invalid repository path.");
  const encoded = segments.map(encodeURIComponent).join("/");
  const ref = branch.split("/").map(encodeURIComponent).join("/");
  return raw
    ? `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${encoded}`
    : `https://github.com/${owner}/${repo}/blob/${ref}/${encoded}`;
}

export async function fetchText(env: Env, path: string, maxChars = 2_000_000): Promise<string> {
  const response = await fetch(githubPath(env, path), {
    headers: { Accept: "text/plain", "User-Agent": "operating-systems-course-mcp" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status} for ${path}.`);
  const text = await response.text();
  if (text.length > maxChars) throw new Error(`Course file is unexpectedly large: ${path}.`);
  return text;
}

export async function getIndex(env: Env): Promise<CourseIndex> {
  const key = `${env.GITHUB_OWNER}/${env.GITHUB_REPO}/${env.GITHUB_BRANCH || "main"}/${env.GITHUB_CONTENT_ROOT || ""}`;
  if (indexCache?.key === key && indexCache.expires > Date.now()) return indexCache.data;
  const data = JSON.parse(await fetchText(env, "course/search-index.json")) as CourseIndex;
  if (data.schema_version !== 1 || !Array.isArray(data.chapters) || !Array.isArray(data.sections)) throw new Error("The course search index has an unsupported format.");
  indexCache = { key, expires: Date.now() + 60_000, data };
  return data;
}

export function chapterOf(index: CourseIndex, number: number): ChapterRow {
  const chapter = index.chapters.find((item) => item.number === number);
  if (!chapter) throw new Error(`Chapter ${number} is not configured in this course.`);
  return chapter;
}

export function searchIndex(index: CourseIndex, query: string, chapter?: number, limit = 5) {
  const base = tokens(query);
  const expanded = [...base];
  for (const term of base) if (ALIASES[term]) expanded.push(...tokens(ALIASES[term]));
  const terms = [...new Set(expanded)].slice(0, 30);
  if (!terms.length) return [];
  const N = index.sections.length;
  const avg = index.average_length || 1;
  const practiceRequested = /\b(exercise|practice|quiz|question|problem)\b/i.test(query);
  return index.sections
    .filter((section) => chapter === undefined || section.chapter === chapter)
    .map((section) => {
      let relevance = 0;
      for (const term of terms) {
        const frequency = section.terms[term] || 0;
        if (!frequency) continue;
        const df = index.document_frequency[term] || 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        relevance += idf * (frequency * 2.2) / (frequency + 1.2 * (0.25 + 0.75 * section.length / avg));
        if (tokens(section.title).includes(term)) relevance += idf * 1.5;
      }
      if (!practiceRequested && /\b(exercises?|practice|review|questions?|following|consider|suppose|calculate)\b/i.test(section.title)) relevance *= 0.5;
      return { section, relevance };
    })
    .filter((row) => row.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || a.section.id.localeCompare(b.section.id))
    .slice(0, Math.max(1, Math.min(limit, 8)));
}

export async function getSectionText(env: Env, index: CourseIndex, section: SectionRow): Promise<string> {
  const chapter = chapterOf(index, section.chapter);
  const content = (await fetchText(env, `${chapter.folder}/content.md`)).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const bytes = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const actualHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (actualHash !== chapter.content_sha256) throw new Error(`Chapter ${chapter.number} content changed after the search index was built. Run npm run build:index and push course/search-index.json.`);
  return section.spans.map(({ start, end }) => content.slice(start, end).trim()).join("\n\n---\n\n");
}
