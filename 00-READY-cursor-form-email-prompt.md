# Cursor prompt — free-estimate form emails Kyle

Paste everything below the line into Cursor.

---

You are Lane 3 (Cursor). Make the Montana Movers free-estimate form email each request to Kyle. Why: right now a valid submit only hands the visitor a prefilled text, so a lead who doesn't press send is lost.

Read first: `AGENTS.md`, the newest `FGA-AIOS/model-routing/session-handoff.md` entries, `FGA-AIOS/clients/montana-movers/website/README.md`, `site.config.mjs`, the form code in `src/`, and `wiki/builds/local-business-website-seo-blueprint.md` (step 5 and the 6b verification gate). Copy the working pattern from Bridger Bayworks: `FGA-AIOS/clients/bridger-bayworks/website/review/00-READY-n8n-lead-email.md`.

Kyle's email address: [THOMAS FILLS IN]. Never commit it anywhere except `site.config.mjs` if it is meant to be public. Otherwise keep it only in the n8n node.

Build:
1. n8n workflow "Montana Movers — Website Lead Email" on tggai.app.n8n.cloud: `POST /webhook/montana-movers-lead` → validate (name and phone required, honeypot empty, field length caps) → send one email to Kyle. Subject: "New moving estimate request: {name}". Body: every form field, the page it came from, and the time in Mountain time. Set reply-to to the lead's email when given. Respond 200 `{ok:true}` only after the email node succeeds; return 4xx on bad input and 5xx on failure (`options.responseCode`, not top level). CORS allows only `https://thomasg42.github.io` and the future domain. Use an existing Gmail credential only after Thomas names which one. Leave it unpublished until Thomas approves; n8n saves drafts, so publishing is a separate step.
2. Site: set `leadEndpoint` in `site.config.mjs` to the production webhook URL. Keep Bridger's failure handling: only `r.ok` shows thanks; an error keeps every value and still offers the text to Kyle. Keep the honeypot. No speed-to-lead call and no SMS; that comes later.
3. Tests: add a form test for the endpoint path (success, 500, double submit). `node build.mjs && node --test tests/site.test.mjs` all green.
4. Verify (blocking): run `tools/site-qa/site-qa.mjs` against a local build with zero FAILs, the happy path confirmed reaching n8n. Then send ONE test lead marked "TEST - Thomas", and only after Thomas says Kyle has been told a test is coming. Confirm it landed in Kyle's inbox.

Stop and ask Thomas for: Kyle's email, which Gmail account sends, publishing the workflow, and the one live test send. Do not deploy the site; Thomas runs `deploy-preview.sh`.

Done = workflow built and published with approval, site posts to it, tests and site-qa green, one confirmed test email in Kyle's inbox, handoff entry written. Report the workflow ID, the test output lines, and the site-qa summary. Claim only what you verified.
