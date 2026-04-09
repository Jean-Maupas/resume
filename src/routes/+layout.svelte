<script lang="ts">
  import '../app.css';
</script>

<slot />

<style>
  :global(*) { box-sizing: border-box; margin: 0; padding: 0; }

  :global(body) {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 15px;
    line-height: 1.65;
    color: #1a1a1a;
    background: #f5f4f0;
  }

  :global(a) { color: #1a4e8c; }
  :global(a:hover) { text-decoration: underline; }

  /* ── Print ── */
  @media print {
    :global(.no-print) { display: none !important; }
    :global(body) {
      background: white;
      font-size: 10pt;
      color: black;
    }
    :global(.cv-page) {
      max-width: 100%;
      padding: 0;
      box-shadow: none;
    }
    :global(.section-body) { display: block !important; }
    :global(.section-toggle) { cursor: default; }
    :global(.chevron) { display: none; }
    :global(a) { color: inherit; text-decoration: none; }
    :global(a.company-link::after) { content: ''; }
    :global(h2) { page-break-after: avoid; }
    :global(.work-entry) { page-break-inside: avoid; }
  }
</style>
