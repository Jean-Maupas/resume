<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { PageData, ActionData } from './$types';
  import { SUBMISSION_STATUSES, STATUS_LABELS, STATUS_COLOR } from '$db/submissions';
  import type { SubmissionStatus } from '$db/submissions';

  export let data: PageData;
  export let form: ActionData;

  const profiles = ['clinical_research', 'data_science', 'software_engineering', 'information_systems'];

  // Edit mode — pre-populate from ?edit= query param
  $: editId = $page.url.searchParams.get('edit');
  $: editing = editId ? data.submissions.find(s => s.id === editId) : null;

  let showNew = false;
</script>

<svelte:head><title>Admin — Submissions</title></svelte:head>

<div class="sub-header">
  <h1 class="page-title">Submissions</h1>
  <button class="btn btn-primary" on:click={() => (showNew = !showNew)}>
    {showNew ? 'Cancel' : '+ Add submission'}
  </button>
</div>

{#if form?.error}
  <div class="alert-error">{form.error}</div>
{/if}

<!-- New submission form -->
{#if showNew}
  <div class="form-card">
    <h2>New submission</h2>
    <form method="POST" action="?/create" use:enhance on:submit={() => (showNew = false)}>
      <div class="form-grid">
        <label>Company <input name="company" required /></label>
        <label>Position <input name="position" required /></label>
        <label>Job URL <input name="job_url" type="url" /></label>
        <label>Date applied <input name="date_applied" type="date" /></label>
        <label>Profile used
          <select name="profile_used">
            {#each profiles as p}<option value={p}>{p}</option>{/each}
          </select>
        </label>
        <label>Status
          <select name="status">
            {#each SUBMISSION_STATUSES as s}
              <option value={s}>{STATUS_LABELS[s]}</option>
            {/each}
          </select>
        </label>
        <label>CV version
          <select name="cv_version_id">
            <option value="">— none —</option>
            {#each data.versions as v}
              <option value={v.id}>{v.label ?? v.id.slice(0,8)} {v.is_current ? '(current)' : ''}</option>
            {/each}
          </select>
        </label>
      </div>
      <label class="wide">Notes <textarea name="notes" rows="3"></textarea></label>
      <button type="submit" class="btn btn-primary">Save</button>
    </form>
  </div>
{/if}

<!-- Edit form (opens when ?edit= is set) -->
{#if editing}
  <div class="form-card editing">
    <h2>Edit submission</h2>
    <form method="POST" action="?/update" use:enhance>
      <input type="hidden" name="id" value={editing.id} />
      <div class="form-grid">
        <label>Company <input name="company" value={editing.company} required /></label>
        <label>Position <input name="position" value={editing.position} required /></label>
        <label>Job URL <input name="job_url" type="url" value={editing.job_url ?? ''} /></label>
        <label>Date applied <input name="date_applied" type="date" value={editing.date_applied ?? ''} /></label>
        <label>Profile used
          <select name="profile_used">
            {#each profiles as p}
              <option value={p} selected={editing.profile_used === p}>{p}</option>
            {/each}
          </select>
        </label>
        <label>Status
          <select name="status">
            {#each SUBMISSION_STATUSES as s}
              <option value={s} selected={editing.status === s}>{STATUS_LABELS[s]}</option>
            {/each}
          </select>
        </label>
        <label>CV version
          <select name="cv_version_id">
            <option value="">— none —</option>
            {#each data.versions as v}
              <option value={v.id} selected={editing.cv_version_id === v.id}>
                {v.label ?? v.id.slice(0,8)} {v.is_current ? '(current)' : ''}
              </option>
            {/each}
          </select>
        </label>
      </div>
      <label class="wide">Notes <textarea name="notes" rows="3">{editing.notes ?? ''}</textarea></label>
      <div class="form-footer">
        <button type="submit" class="btn btn-primary">Update</button>
        <a href="/admin/submissions" class="btn btn-ghost">Cancel</a>
      </div>
    </form>
  </div>
{/if}

<!-- Submissions table -->
<div class="table-card">
  {#if data.submissions.length === 0}
    <p class="empty">No submissions yet.</p>
  {:else}
    <table class="table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Position</th>
          <th>Profile</th>
          <th>Status</th>
          <th>CV version</th>
          <th>Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.submissions as s}
          <tr class:row-editing={editId === s.id}>
            <td>
              {#if s.job_url}
                <a href={s.job_url} target="_blank" rel="noopener">{s.company}</a>
              {:else}
                {s.company}
              {/if}
            </td>
            <td>{s.position}</td>
            <td><code>{s.profile_used}</code></td>
            <td>
              <span class="badge badge-{STATUS_COLOR[s.status as SubmissionStatus]}">
                {STATUS_LABELS[s.status as SubmissionStatus]}
              </span>
            </td>
            <td class="version-cell">
              {#if s.cv_label}
                <span title={s.cv_version_id ?? ''}>{s.cv_label}</span>
              {:else if s.cv_version_id}
                <code>{s.cv_version_id.slice(0, 8)}</code>
              {:else}
                <span class="dim">—</span>
              {/if}
            </td>
            <td>{s.date_applied ?? '—'}</td>
            <td class="actions-cell">
              <a href="?edit={s.id}" class="btn-link">Edit</a>
              <form method="POST" action="?/delete" use:enhance style="display:inline">
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" class="btn-link danger"
                  on:click={e => !confirm('Delete this submission?') && e.preventDefault()}>
                  Del
                </button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .page-title { font-size: 20px; font-weight: 700; }
  .alert-error { background: #fee2e2; color: #7f1d1d; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }

  .form-card {
    background: white; border: 1px solid #e0ddd8; border-radius: 10px;
    padding: 20px; margin-bottom: 20px;
  }
  .form-card.editing { border-color: #1a4e8c; }
  .form-card h2 { font-size: 14px; font-weight: 600; margin-bottom: 14px; }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
    margin-bottom: 10px;
  }
  label { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #555; font-weight: 500; }
  input, select, textarea {
    padding: 7px 9px; border: 1px solid #ccc; border-radius: 6px;
    font-size: 13px; font-family: inherit; color: #111;
  }
  .wide { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: #555; font-weight: 500; margin-bottom: 12px; }
  .form-footer { display: flex; gap: 8px; align-items: center; }

  .table-card { background: white; border: 1px solid #e0ddd8; border-radius: 10px; overflow: hidden; }
  .table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .table th { text-align: left; padding: 10px 12px; background: #f9f8f5; border-bottom: 1px solid #e0ddd8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
  .table td { padding: 9px 12px; border-bottom: 1px solid #f0ede8; }
  .table tr:last-child td { border-bottom: none; }
  .row-editing td { background: #eff6ff; }
  .table a { color: #1a4e8c; text-decoration: none; }
  .table a:hover { text-decoration: underline; }
  code { font-size: 11px; background: #f3f4f6; padding: 1px 5px; border-radius: 4px; }
  .dim { color: #bbb; }
  .version-cell { font-size: 12px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .actions-cell { white-space: nowrap; }

  .btn { padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; text-decoration: none; display: inline-flex; align-items: center; }
  .btn-primary { background: #1a4e8c; color: white; }
  .btn-ghost { background: none; color: #555; border-color: #ccc; font-size: 13px; padding: 6px 12px; }
  .btn-link { background: none; border: none; padding: 0; font-size: 12px; color: #1a4e8c; cursor: pointer; font-family: inherit; margin-right: 8px; }
  .btn-link:hover { text-decoration: underline; }
  .btn-link.danger { color: #b91c1c; }
  .empty { padding: 24px; text-align: center; color: #999; font-size: 14px; }
</style>
