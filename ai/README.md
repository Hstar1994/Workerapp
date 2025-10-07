# AI Prompt Files

This folder contains prompt templates for future AI features. Prompts use variable tokens like `{{job_title}}`, `{{required_expertise}}`, `{{candidate_list}}`, `{{week_range}}`, etc.

## Usage
- Prompts are loaded and filled with variables by the backend.
- AI is off by default (see `AI_ENABLED` flag).
- No external calls are made in v0.1; only stub responses are returned.

## Prompt files
- `suggest_workers.system.txt` / `suggest_workers.user.txt`: Suggest top 5 workers for a job.
- `schedule_summary.system.txt` / `schedule_summary.user.txt`: Summarize the schedule for a week.
- `job_change_reason_check.system.txt` / `job_change_reason_check.user.txt`: Check if a reason for a job change is valid.
