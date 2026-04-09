<script lang="ts">
  import type { WorkEntry } from '$cv/schema';
  export let job: WorkEntry;
</script>

<div class="work-entry">
  <div class="work-header">
    <div class="work-left">
      {#if job.url}
        <a class="company-link" href={job.url} target="_blank" rel="noopener">{job.name}</a>
      {:else}
        <span class="company-name">{job.name}</span>
      {/if}
      <span class="work-position">{job.position}</span>
    </div>
    <span class="work-dates">{job.startDate} – {job.endDate}</span>
  </div>
  <ul class="work-bullets">
    {#each job.highlights as h}
      <li>{h.text}</li>
    {/each}
  </ul>
</div>

<style>
  .work-entry { margin-bottom: 20px; }

  .work-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 6px;
  }

  .work-left { display: flex; flex-direction: column; gap: 1px; }

  .company-link, .company-name {
    font-weight: 700;
    font-size: 14px;
    color: #1a1a1a;
  }
  .company-link { text-decoration: none; color: #1a4e8c; }
  .company-link:hover { text-decoration: underline; }

  .work-position {
    font-size: 13.5px;
    color: #333;
    font-style: italic;
  }

  .work-dates {
    font-size: 12.5px;
    color: #666;
    white-space: nowrap;
    font-family: system-ui, sans-serif;
  }

  .work-bullets {
    padding-left: 18px;
    margin: 0;
  }
  .work-bullets li {
    font-size: 13.5px;
    margin-bottom: 3px;
    line-height: 1.6;
  }
</style>
