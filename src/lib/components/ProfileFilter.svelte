<script lang="ts">
  import type { ProfileMeta, ProfileId } from '$cv/schema';

  export let profiles: ProfileMeta[];
  export let active: ProfileId | null;

  function href(id: ProfileId | null) {
    return id ? `/?profile=${id}` : '/';
  }
</script>

<nav class="profile-filter no-print" aria-label="CV profile">
  <a class="chip" class:active={active === null} href="/">Full CV</a>
  {#each profiles as p}
    <a class="chip" class:active={active === p.id} href={href(p.id)}>{p.label}</a>
  {/each}
</nav>

<style>
  .profile-filter { display: flex; gap: 6px; flex-wrap: wrap; }

  .chip {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    color: #444;
    background: #e8e7e2;
    border: 1px solid transparent;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .chip:hover { background: #d4d3ce; }
  .chip.active {
    background: #1a4e8c;
    color: white;
    border-color: #1a4e8c;
  }
</style>
