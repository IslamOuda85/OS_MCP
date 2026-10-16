# Operating Systems Course MCP

A read-only remote MCP server for Claude Projects and ChatGPT Projects. It searches a generated section index stored in the public GitHub repository, fetches selected source sections, and returns original repository images as MCP image content.

Paste [`../PROJECT_INSTRUCTIONS.md`](../PROJECT_INSTRUCTIONS.md) into each platform's Project instructions. It tells the assistants how to retrieve course evidence, teach the material, render retrieved images when the host supports it, and create helpful diagrams or study artifacts when appropriate. The server also sends short shared instructions during MCP initialization.

## Tools exposed to connected assistants

- `get_course_metadata`: report course scope, retrieval method, and review limitations.
- `list_course_chapters`: list the configured 13 course chapters.
- `search_course_material`: rank short section previews with BM25 and curated OS acronym aliases.
- `get_section`: fetch a stable section ID, joining repeated source blocks and paging long sections.
- `get_teaching_context`: bundle a fetched section, its linked image metadata, and a focused lesson sequence.
- `get_chapter_outline`: list the source hierarchy, section IDs, and linked images.
- `get_data_card`: read extraction status and unresolved issues for a chapter.
- `list_chapter_assets` and `get_asset_metadata`: discover original figures, source labels, URLs, and description confidence.
- `get_asset`: return a manifest-listed original image as MCP image content after checking its SHA-256 hash.
- `get_chapter_material` and `get_course_image`: compatibility tools for existing project chats.
- `get_tutor_methodology`: retrieve the course's teaching-method instructions.

All tools are read-only. Search fetches one generated index file from the configured GitHub branch and caches it for up to one minute per Worker instance. `get_section` fetches only the selected chapter file and checks it against the index hash. Assets are fetched from GitHub only when requested and checked against their manifest hash. The repository must be public; private-repository credentials and OAuth are not configured.

## Repository layout expected

The configured repository root (or `GITHUB_CONTENT_ROOT`) should contain:

```text
OS_TUTOR_METHODOLOGY_SYSTEM_PROMPT.md
course/search-index.json
Chapter_01/content.md
Chapter_01/data_card.md
Chapter_01/assets/manifest.json
Chapter_01/assets/...
...
Chapter_18/assets/manifest.json
```

The image tool checks `assets/manifest.json` before returning a file, so only indexed chapter assets can be fetched. Images are limited to PNG, JPEG, GIF, or WebP and 15 MB per tool call. The largest image currently in the workspace is about 13 MB.

## Configure and deploy

1. Upload the course files, chapter folders, assets, `course/search-index.json`, and this `mcp-server/` folder to a **public GitHub repository**. Keep the chapter folder names and asset manifests intact.
2. Install Node.js 20 or newer.
3. From this folder, edit `wrangler.jsonc` and set `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH`. Set `GITHUB_CONTENT_ROOT` only if the course files live below a subdirectory in the repository.
4. After changing any chapter `content.md`, rebuild and commit the index before deploying or using the changed content:

   ```powershell
   npm run build:index
   git add ../course/search-index.json
   git commit -m "Refresh OS course search index"
   git push
   ```

   If you also changed assets, include the manifest and image files in the same commit. A content hash mismatch causes `get_section` to fail with a rebuild message; an image hash mismatch causes `get_asset` to fail. The index builder checks section metadata and asset references, but it cannot verify that extracted text or image descriptions match the original textbook.
5. In this folder, run:

   ```powershell
   npm install
   npm run dev
   ```

   The local MCP endpoint is `http://localhost:8787/mcp`.
6. Deploy to a Cloudflare account **after the index file is on GitHub**:

   ```powershell
   npx wrangler login
   npm run deploy
   ```

   Wrangler prints the public `workers.dev` URL. The MCP endpoint is that URL plus `/mcp`.
7. Connect the server to Claude from **Settings → Connectors → Add custom connector** and paste the endpoint. Add/enable the app for the ChatGPT account or workspace, then select it from the tools menu in project chats that need fresh course data. Custom MCP app access in ChatGPT depends on the account plan, developer-mode setting, and workspace controls. The server is unauthenticated and read-only; do not add private course material to the public-repository setup.

GitHub stores the files and source code; Cloudflare Workers runs the public MCP endpoint. The server code requires deployment after changes to `mcp-server/src/`. Content changes require a rebuilt index committed with the content. GitHub changes are visible to the Worker after its short index cache expires; image changes require an updated manifest hash.

## Notes

- This server does not upload, modify, or delete GitHub content.
- `get_asset` and `get_course_image` return original image bytes in an MCP image block. Results include a Markdown image URL as a display fallback and repository metadata.
- Whether an MCP image block is displayed inline is controlled by the host. The portable project instructions tell the assistant to render it inline when supported and otherwise provide a link/path plus explanation.
- The hosted Worker adds CORS headers for browser-based MCP clients and serves MCP at `/mcp`.
- Search uses a generated BM25 section index. It is lexical retrieval with acronym aliases, not vector or semantic retrieval. If a paraphrase misses, try the course term or inspect `get_chapter_outline`.
- The current extracted corpus still contains unresolved image/code placeholders and chapter metadata marked for review. Many assets have generic, low-confidence descriptions. This server reports that limitation and never labels the corpus fully verified. There is no verified OS question bank yet.
- If the repository is private, add a GitHub App/token or OAuth authorization layer before making the Worker endpoint available. Do not put a token in `wrangler.jsonc` or commit secrets.
