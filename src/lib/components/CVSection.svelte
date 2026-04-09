<script lang="ts">
  export let title: string;
  export let openByDefault = false;

  let open = openByDefault;
  const toggle = () => (open = !open);
</script>

<section class="cv-section">
  <button
    class="section-toggle"
    on:click={toggle}
    aria-expanded={open}
    aria-controls="section-{title}"
  >
    <h2>{title}</h2>
    <svg
      class="chevron"
      class:rotated={open}
      width="16" height="16" viewBox="0 0 16 16"
      fill="none" aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <div id="section-{title}" class="section-body" class:hidden={!open}>
    <slot />
  </div>
</section>

<style>
  .cv-section {
    margin-bottom: 24px;
    border-bottom: 1px solid #e0ddd8;
    padding-bottom: 8px;
  }

  .section-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1a4e8c;
    font-family: system-ui, sans-serif;
  }

  .chevron {
    color: #888;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }
  .chevron.rotated { transform: rotate(180deg); }

  .section-body { }
  .section-body.hidden { display: none; }
</style>
