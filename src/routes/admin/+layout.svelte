<script lang="ts">
  import { page } from '$app/stores';
  const links = [
    { href: '/admin',             label: 'Dashboard' },
    { href: '/admin/cv',          label: 'CV Editor' },
    { href: '/admin/submissions', label: 'Submissions' }
  ];
</script>

<div class="admin-shell">
  <nav class="admin-nav">
    <a class="brand" href="/admin">Resume Admin</a>
    <div class="nav-links">
      {#each links as l}
        <a class="nav-link" class:active={$page.url.pathname === l.href} href={l.href}>{l.label}</a>
      {/each}
    </div>
    <form method="POST" action="/admin/logout" class="logout-form">
      <button type="submit" class="logout-btn">Sign out</button>
    </form>
  </nav>

  <main class="admin-main">
    <slot />
  </main>
</div>

<style>
  :global(body) { background: #f5f4f0; font-family: system-ui, sans-serif; }

  .admin-shell { min-height: 100vh; display: flex; flex-direction: column; }

  .admin-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 24px;
    height: 52px;
    background: #1a2a3a;
    color: white;
    flex-shrink: 0;
  }

  .brand { color: white; font-weight: 700; font-size: 15px; text-decoration: none; margin-right: 16px; }

  .nav-links { display: flex; gap: 4px; flex: 1; }

  .nav-link {
    padding: 6px 12px;
    border-radius: 6px;
    color: #a0b0c0;
    text-decoration: none;
    font-size: 13px;
    transition: background 0.15s, color 0.15s;
  }
  .nav-link:hover { background: rgba(255,255,255,0.08); color: white; }
  .nav-link.active { background: rgba(255,255,255,0.12); color: white; }

  .logout-form { margin-left: auto; }
  .logout-btn {
    background: none;
    border: 1px solid rgba(255,255,255,0.2);
    color: #a0b0c0;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }
  .logout-btn:hover { border-color: rgba(255,255,255,0.4); color: white; }

  .admin-main { flex: 1; padding: 32px 24px; max-width: 1200px; margin: 0 auto; width: 100%; }
</style>
