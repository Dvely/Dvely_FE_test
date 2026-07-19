// Backend `change` bounded context (change/presentation/dto). A `ChangeResponse`
// represents one Agent CODE task's code-change result — one row is created every
// time a CODE step succeeds. Introduced together with the Track Z (#56) two-step
// result-approval flow: a change starts at PREVIEW_READY the moment its CODE step
// finishes, and only becomes MERGED (reflected into main) once the project's
// RESULT approval gate lets it through — or REJECTED if a human declines it.
// Projects with `resultApprovalRequired: false` (see `types/project.ts`
// `ProjectChatSettingsResponse`) skip the gate, so changes there go straight to
// MERGED/DEPLOYED through the pre-#56 path instead of pausing at PREVIEW_READY.
export type ChangeStatus = 'PREVIEW_READY' | 'MERGED' | 'REJECTED' | 'DEPLOYED'

export interface ChangeResponse {
  changeId: number
  projectId: number
  conversationId: number
  taskId: string
  // Preview session this change can be inspected through. May point at an
  // already-expired/torn-down session — not re-validated on every read.
  previewSessionId: string | null
  status: ChangeStatus
  summary: string
  // RESULT approval that decided this change's MERGED/REJECTED outcome. Null for
  // changes predating the result-approval gate, or for projects where
  // `resultApprovalRequired` is false (gate never fires).
  approvalId: number | null
  // preview -> main PR number. Null when there were no new commits to merge — the
  // gate still resolves straight to MERGED without opening a PR in that case.
  prNumber: number | null
  // Only set once `status` is MERGED.
  mergeCommitSha: string | null
  // Only set once `status` is MERGED (the transition timestamp, not creation time).
  mergedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ChangeDiffResponse {
  changeId: number
  // Unified diff text. Render as-is (e.g. inside a `<pre>`) — do not reformat.
  diff: string
}
