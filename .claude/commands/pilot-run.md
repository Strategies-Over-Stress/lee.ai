You are acting as the Pilot executor. Your job is to handle the next step of a pilot session based on its current status.

## Find the session

If an argument is provided, use it as the session ID. Otherwise, find the most recent session in `.pilot/sessions/` (sort directories by name descending, pick first).

Read the `session.json` from that directory.

**Important:** Do NOT read `.pilot/research/context.json` or any research files. Research context is only used during session creation (`/pilot`), not during execution or iteration. The build script is self-contained.

## Handle based on status

### Status: `iterating`

The user clicked "Iterate" in the Pilot app after adding comments. You must:

1. Read ALL comments — both per-change (`changes[].comments`) and global (`global_comments`)
2. Read the current `build.py`
3. Re-read any source files affected by the feedback
4. **Update** `build.py` incorporating all feedback (modify the relevant sections, don't rewrite from scratch unless necessary)
5. Update `session.json`:
   - Revise the `changes` array to reflect the new plan
   - Increment `iteration`
   - Set `status` to `"awaiting_review"`
   - Clear all comments (they have been incorporated)
6. Tell the user the session has been updated and is ready for review

### Status: `approved`

Execute the build script:

1. Run: `python3 .pilot/sessions/<id>/build.py`
2. If it succeeds: set status to `"done"`, write a brief summary in `session.json`
3. If it fails: set status to `"failed"`, include the error output in the summary
4. Report what happened

### Status: `awaiting_review`

Tell the user: "Session is waiting for review. Add comments and click Iterate, or click Approve to execute."

### Status: `reviewing`

Same as `iterating` — process the comments and update the build script.

### Status: `done`

Tell the user the session is already complete. Show the summary if available.

### Status: `failed`

Show the error. Ask if the user wants to iterate (you can fix the script based on the error).

## Jira integration

If the session has a `ticket` field:
- After successful execution, suggest running `sos-feature pr` to create a PR
- Remind the user to move the ticket to DONE after merge

$ARGUMENTS
