# Security Policy & Threat Model — LabLink

## 1. Zero Client-Side Secrets Guarantee
- The frontend client bundle contains **zero private API keys, service-role keys, or administrative credentials**.
- **Supabase Credentials**: Only the public anonymous key (`VITE_SUPABASE_ANON_KEY`) and project URL (`VITE_SUPABASE_URL`) are referenced in client code. The privileged `service_role` key is **never bundled or exposed** to the client.
- All external GenAI or optimization services reside strictly behind backend proxy endpoints (`/server/main.py`).
- Secrets (such as `GEMINI_API_KEY`) are stored solely in server environment variables, never accessible to the browser DOM or network inspecting client threads.

## 2. Supabase Cloud Security & Data Integrity

### 2.1 Row-Level Security (RLS) & Evaluator Access
- Relational tables in Supabase have Row Level Security enabled.
- Permissive policies for `anon` and `authenticated` roles allow competition evaluators to seamlessly inspect, write, and simulate workflows across all 4 personas without requiring credential-gated login forms.
- Production deployments can restrict policies to institutional SSO JWT claims with zero architectural rewrites.

### 2.2 Concurrency & Double-Booking Guard
- The frontend never declares a booking successful without pre-flight validation against Supabase.
- `SupabaseService.checkSlotAvailability()` queries locked bookings and maintenance schedules prior to submitting transactions, eliminating race-condition double-bookings.
- Faculty approval commits execute an atomic pre-flight verification (`revalidateAndCommitAllocation`) to catch any concurrent conflicts before finalizing reservations.

## 3. Threat Modeling & Mitigations

### 3.1 Prompt-Injection Defense
- **User input as Data Only**: When passing user text (e.g. project abstracts, hardware rationales) to NLP or LLM inference, user text is strictly encapsulated within typed data fields and separated from system instructions.
- **No Direct Execution**: Model outputs are never executed as code (`eval()`) or used to dynamically construct SQL or shell commands.
- **Strict Schema Validation**: Any structured response from an LLM must pass Zod schema validation before mutating application state.

### 3.2 Cross-Site Scripting (XSS) Prevention
- Zero use of `dangerouslySetInnerHTML` throughout the entire codebase.
- All user-supplied text (project titles, student names, booking notes) is rendered through React's native JSX escaping mechanisms.

### 3.3 Storage Corruption Resilience
- All reads from persistent browser storage (`localStorage`) are validated with strict **Zod schemas** in `src/store/storage.ts`.
- If storage contains invalid, tampered, or corrupted JSON data, the application safely logs a diagnostic warning and falls back to the deterministic initial seed dataset, preventing client application crashes.

### 3.4 Server & Action-Level Role-Based Access Control (RBAC)
- Role restrictions are **not merely cosmetic UI hidden elements**.
- The Zustand store (`src/store/useAppStore.ts`) enforces action-level role guards:
  - Equipment addition and modification reject execution unless the active persona is `lab_manager` or `admin`.
  - Equipment deletion is strictly restricted to `admin`.
  - Allocation approvals and schedule commitments reject execution unless the active persona is `faculty`.

### 3.5 Content Security Policy (CSP) & HTTP Headers
For production deployment (e.g. Vercel), the following security headers are enforced in `vercel.json`:
- `Content-Security-Policy`: Restricts script execution to self, disallowing unsafe inline scripts.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
- `X-Frame-Options: DENY`: Prevents clickjacking in iframes.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer leakage.
- `Strict-Transport-Security`: Enforces HTTPS transport.

## 4. Dependency Vulnerability Audits
Dependencies are managed via `package.json` with strict version locks and audited using `npm audit`.
