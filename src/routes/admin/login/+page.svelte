<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  export let form: ActionData;
</script>

<svelte:head><title>Admin — Login</title></svelte:head>

<div class="login-shell">
  <form method="POST" use:enhance class="login-card">
    <h1>Admin</h1>
    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}
    <label>
      Password
      <input type="password" name="password" autocomplete="current-password" required />
    </label>
    <button type="submit">Sign in</button>
  </form>
</div>

<style>
  .login-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f4f0;
  }
  .login-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    border: 1px solid #ddd;
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  h1 { font-size: 20px; font-weight: 700; font-family: system-ui, sans-serif; }
  label { display: flex; flex-direction: column; gap: 4px; font-family: system-ui, sans-serif; font-size: 13px; }
  input {
    padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px;
  }
  button {
    padding: 10px; background: #1a4e8c; color: white; border: none;
    border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: system-ui, sans-serif;
  }
  button:hover { opacity: 0.9; }
  .error { color: #b91c1c; font-size: 13px; font-family: system-ui, sans-serif; }
</style>
