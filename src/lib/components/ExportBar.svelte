<script lang="ts">
  import type { ProfileId } from '$cv/schema';
  export let name: string;
  export let profile: ProfileId | null;

  function printPdf() {
    window.print();
  }

  function docxHref() {
    const params = profile ? `?profile=${profile}` : '';
    return `/api/cv/docx${params}`;
  }
</script>

<div class="export-bar no-print">
  <button class="btn btn-primary" on:click={printPdf}>
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6V2h8v4M4 12H2V7h12v5h-2M4 9h8v5H4V9z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
    Save as PDF
  </button>
  <a class="btn btn-secondary" href={docxHref()} download="{name.replace(/\s+/g, '_')}_CV.docx">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M9 2v4h4M6 9l2 2 2-2M8 7v4" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Download DOCX
  </a>
</div>

<style>
  .export-bar { display: flex; gap: 8px; margin-left: auto; }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 6px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition: opacity 0.15s;
  }
  .btn:hover { opacity: 0.85; }

  .btn-primary {
    background: #1a4e8c;
    color: white;
    border-color: #1a4e8c;
  }
  .btn-secondary {
    background: white;
    color: #333;
    border-color: #ccc;
  }
</style>
