import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const courseRoot = resolve(serverRoot, "..");
const chapterNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 16, 18];
const stopwords = new Set("a an and are as at be by can do does for from how in into is it of on or that the their these this to was were what when where which with you your".split(" "));

function tokens(value) {
  return (value.toLowerCase().match(/[a-z0-9]+/g) || []).filter((term) => term.length > 1 && !stopwords.has(term));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseSections(content, chapter, manifest) {
  const headings = [...content.matchAll(/^(#{1,6})\s+(.+)$/gm)];
  const sections = [];
  const stack = [];
  const byId = new Map();
  const assetIds = new Set(manifest.assets.map((asset) => asset.id));
  for (let i = 0; i < headings.length; i++) {
    const match = headings[i];
    const level = match[1].length;
    const title = match[2].trim();
    const start = match.index + match[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : content.length;
    const body = content.slice(start, end).trim();
    const metadata = body.match(/^>\s*id:\s*([^|\r\n]+)\s*\|\s*src:\s*([^|\r\n]+)(?:\s*\|\s*kind:\s*([^\r\n]+))?/);
    if (!metadata) throw new Error(`Missing section metadata: Chapter ${chapter}, ${title}`);
    const sourceId = metadata[1].trim();
    while (stack.length && stack.at(-1).level >= level) stack.pop();
    const parent = stack.at(-1)?.id || null;
    const original = byId.get(sourceId);
    const id = original && (original.title !== title || original.parent !== parent)
      ? `${sourceId}--${sha256(`${title}|${parent || ""}`).slice(0, 8)}`
      : sourceId;
    const assets = [...new Set([...body.matchAll(/\[ASSET(?:_REF)?\s+([\w-]+)\]/g)].map((ref) => ref[1]))];
    for (const asset of assets) if (!assetIds.has(asset)) throw new Error(`Unknown asset ${asset} in ${id}`);
    const termList = tokens(`${title} ${title} ${body}`);
    const termCounts = {};
    for (const term of termList) termCounts[term] = (termCounts[term] || 0) + 1;
    const section = {
      id, source_id: sourceId, chapter, title, level, parent, children: [],
      source: metadata[2].trim(), kind: metadata[3]?.trim() || "concept",
      asset_ids: assets, spans: [{ start, end }], length: termList.length,
      terms: termCounts,
      preview: body.replace(/^>[^\r\n]*\r?\n/, "").replace(/\s+/g, " ").slice(0, 360),
    };
    const existing = byId.get(id);
    if (existing) {
      if (existing.title !== title || existing.parent !== parent) throw new Error(`Conflicting metadata for repeated section ${id} in Chapter ${chapter}`);
      existing.spans.push({ start, end });
      existing.length += section.length;
      for (const [term, count] of Object.entries(termCounts)) existing.terms[term] = (existing.terms[term] || 0) + count;
      existing.asset_ids = [...new Set([...existing.asset_ids, ...assets])];
      if (!existing.source.includes(section.source)) existing.source += `; ${section.source}`;
    } else {
      byId.set(id, section);
      sections.push(section);
    }
    if (stack.length && !stack.at(-1).children.includes(id)) stack.at(-1).children.push(id);
    stack.push(existing || section);
  }
  return sections;
}

const chapters = [];
const sections = [];
for (const number of chapterNumbers) {
  const folder = `Chapter_${String(number).padStart(2, "0")}`;
  const [contentBuffer, manifestBuffer, cardBuffer] = await Promise.all([
    readFile(join(courseRoot, folder, "content.md")),
    readFile(join(courseRoot, folder, "assets", "manifest.json")),
    readFile(join(courseRoot, folder, "data_card.md")),
  ]);
  const content = contentBuffer.toString("utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const manifest = JSON.parse(manifestBuffer.toString("utf8"));
  const card = cardBuffer.toString("utf8");
  const title = card.match(/^title:\s*(.+)$/m)?.[1]?.trim() || folder;
  const chapterSections = parseSections(content, number, manifest);
  chapters.push({
    number, title, folder, section_count: chapterSections.length,
    asset_count: manifest.assets.length,
    content_sha256: sha256(content),
    content_status: card.match(/^extraction_status:\s*(.+)$/m)?.[1]?.trim() || "unknown",
    open_issues: card.match(/^open_issues:\s*(.+)$/m)?.[1]?.trim() || "unknown",
  });
  sections.push(...chapterSections);
}

const documentFrequency = {};
for (const section of sections) {
  for (const term of Object.keys(section.terms)) documentFrequency[term] = (documentFrequency[term] || 0) + 1;
}
const index = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  method: "BM25 over stable course sections; no embeddings",
  chapters, sections, document_frequency: documentFrequency,
  average_length: sections.reduce((sum, section) => sum + section.length, 0) / sections.length,
};
const targetDir = join(courseRoot, "course");
await mkdir(targetDir, { recursive: true });
await writeFile(join(targetDir, "search-index.json"), `${JSON.stringify(index)}\n`);
console.log(`Indexed ${sections.length} sections across ${chapters.length} chapters.`);
