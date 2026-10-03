# Operating Systems Course MCP

A read-only remote MCP server for Claude Projects and ChatGPT Projects. It searches the course Markdown stored in a public GitHub repository and can return repository images as image content in an MCP tool result.

Paste [`../PROJECT_INSTRUCTIONS.md`](../PROJECT_INSTRUCTIONS.md) into each platform's Project instructions. It tells the assistants how to retrieve course evidence, teach the material, render retrieved images when the host supports it, and create helpful diagrams or study artifacts when appropriate. The server also sends short shared instructions during MCP initialization.

## Tools exposed to connected assistants

- `list_course_chapters`: list the configured 13 course chapters.
- `search_course_material`: search across the chapter files, optionally limited to one chapter, and return source-labeled passages.
- `get_chapter_material`: list a chapter's headings or retrieve passages about a topic.
- `list_chapter_assets`: discover chapter images by asset ID, filename, description, or type.
- `get_course_image`: return a manifest-listed image as an actual MCP image result for Claude to inspect.
- `get_tutor_methodology`: retrieve the course's teaching-method instructions.

All tools are read-only. The server fetches files from the configured GitHub branch at request time. The repository must be public; private-repository credentials and OAuth are not configured in this starter.

## Repository layout expected

The configured repository root (or `GITHUB_CONTENT_ROOT`) should contain:

```text
OS_TUTOR_METHODOLOGY_SYSTEM_PROMPT.md
Chapter_01/content.md
Chapter_01/data_card.md
Chapter_01/assets/manifest.json
Chapter_01/assets/...
...
Chapter_18/assets/manifest.json
```

The image tool checks `assets/manifest.json` before returning a file, so only indexed chapter assets can be fetched. Images are limited to PNG, JPEG, GIF, or WebP and 15 MB per tool call. The largest image currently in the workspace is about 13 MB.

## Configure and deploy

1. Upload the course files, chapter folders, assets, and this `mcp-server/` folder to a **public GitHub repository**. Keep the chapter folder names and asset manifests intact.
2. Install Node.js 20 or newer.
3. From this folder, edit `wrangler.jsonc` and set `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH`. Set `GITHUB_CONTENT_ROOT` only if the course files live below a subdirectory in the repository.
4. In this folder, run:

   ```powershell
   npm install
   npm run dev
   ```

   The local MCP endpoint is `http://localhost:8787/mcp`.
5. Deploy to a Cloudflare account:

   ```powershell
   npx wrangler login
   npm run deploy
   ```

   Wrangler prints the public `workers.dev` URL. The MCP endpoint is that URL plus `/mcp`.
6. Connect the server to Claude from **Settings → Connectors → Add custom connector** and paste the endpoint. Add/enable the app for the ChatGPT account or workspace, then select it from the tools menu in project chats that need fresh course data. Custom MCP app access in ChatGPT depends on the account plan, developer-mode setting, and workspace controls. The server is unauthenticated and read-only; do not add private course material to the public-repository setup.

GitHub stores the files and source code; Cloudflare Workers runs the public MCP endpoint. Pushing new files to the configured branch updates what the server can fetch without copying the course corpus into the Worker.

## Notes

- This server does not upload, modify, or delete GitHub content.
- `get_course_image` returns image bytes in an MCP image block so a connected assistant can inspect the diagram or slide. The result also includes a Markdown image URL as a display fallback.
- Whether an MCP image block is displayed inline is controlled by the host. The portable project instructions tell the assistant to render it inline when supported and otherwise provide a link/path plus explanation.
- The hosted Worker adds CORS headers for browser-based MCP clients and serves MCP at `/mcp`.
- `search_course_material` uses lightweight term matching. A larger course collection may benefit from a generated search index or embeddings later.
- The current extracted corpus still contains unresolved image/code placeholders and chapter metadata marked for review. See the root `*_staging/extraction_report.md` for the known vision extraction gap.
- If the repository is private, add a GitHub App/token or OAuth authorization layer before making the Worker endpoint available. Do not put a token in `wrangler.jsonc` or commit secrets.
