<script lang="ts">
  import type { PageData } from './$types';
  import { STATUS_LABELS, STATUS_COLOR } from '$db/submissions';
  export let data: PageData;

  const statusOrder = ['applied','screening','interview','offer','rejected','withdrawn'];
</script>

<svelte:head><title>Admin — Dashboard</title></svelte:head>

<h1 class="page-title">Dashboard</h1>

<div class="card-grid">
  <div class="card">
    <h2>CV versions</h2>
    <p class="stat">{data.versions.length}</p>
    <a href="/admin/cv" class="card-link">Manage CV</a>
  </div>
  <div class="card">
    <h2>Total submissions</h2>
    <p class="stat">{Object.values(data.statusCounts).reduce((a, b) => a + b, 0)}</p>
    <a href="/admin/submissions" class="card-link">View all</a>
  </div>
</div>

<div class="section">
  <h2>Submissions by status</h2>
  <div class="status-row">
    {#each statusOrder as s}
      {@const count = data.statusCounts[s] ?? 0}
      <div class="status-chip badge badge-{STATUS_COLOR[s as keyof typeof STATUS_COLOR]}">
        {STATUS_LABELS[s as keyof typeof STATUS_LABELS]}: {count}
      </div>
    {/each}
  </div>
</div>

<div class="section">
  <div class="section-header">
    <h2>Recent submissions</h2>
    <a href="/admin/submissions">View all →</a>
  </div>
  {#if data.submissions.length === 0}
    <p class="empty">No submissions yet. <a href="/admin/submissions">Add one.</a></p>
  {:else}
    <table class="table">
      <thead>
        <tr><th>Company</th><th>Position</th><th>Profile</th><th>Status</th><th>Date</th></tr>
      </thead>
      <tbody>
        {#each data.submissions as s}
          <tr>
            <td><a href="/admin/submissions?edit={s.id}">{s.company}</a></td>
            <td>{s.position}</td>
            <td><code>{s.profile_used}</code></td>
            <td><span class="badge badge-{STATUS_COLOR[s.status]}">{STATUS_LABELS[s.status]}</span></td>
            <td>{s.date_applied ?? '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .page-title { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card { background: white; border: 1px solid #e0ddd8; border-radius: 10px; padding: 20px; }
  .card h2 { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; color: #666; }
  .stat { font-size: 36px; font-weight: 700; margin: 8px 0; }
  .card-link { font-size: 13px; color: #1a4e8c; }
  .section { background: white; border: 1px solid #e0ddd8; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
  .section h2 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .section-header a { font-size: 13px; color: #1a4e8c; }
  .status-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .table th { text-align: left; padding: 6px 10px; border-bottom: 1px solid #e0ddd8; color: #666; font-weight: 500; }
  .table td { padding: 8px 10px; border-bottom: 1px solid #f0ede8; }
  .table tr:last-child td { border-bottom: none; }
  .table a { color: #1a4e8c; text-decoration: none; font-weight: 500; }
  code { font-size: 11px; background: #f3f4f6; padding: 1px 5px; border-radius: 4px; }
  .empty { color: #888; font-size: 14px; }
</style>
