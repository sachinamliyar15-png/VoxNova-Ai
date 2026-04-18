# AI Personality & Voice Quality Rules

## 1. Voice Quality Lockdown (CRITICAL)
- The current voice generation parameters and `systemInstruction` in `server.ts` are FINISHED and MUST NOT be changed without explicit user permission.
- **Do NOT delete, rename, or modify** the core prompt engineering directives like "Khuli Awaaz", "Damdaar", "Bhari", "Resonant Core", or "Anti-Clipping".
- Any request to "improve" voice should be carefully evaluated against the existing configuration. Always prioritize "Open Projection" and "Clear Articulation".

## 2. Security Alerts
- Never hardcode Firebase API keys or any secrets in the codebase.
- Use `import.meta.env` for client-side and `process.env` for server-side.
- All secrets must be managed via the AI Studio Settings menu and documented in `.env.example`.

## 3. History Persistence
- The history retrieval logic must support both `created_at` and legacy `timestamp` fields.
- Audio data must be capped at 1MB to avoid Firestore limits.

## 4. Stability
- Do not remove or modify the "U Fast" button or its speed logic (1.6x).
- Ensure all endpoints (Guest, Main, Voice Changer) remain synchronized with the same high-quality system instructions.
