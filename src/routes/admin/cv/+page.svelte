<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let editorContainer: HTMLDivElement;
  let editorValue = data.currentYaml;
  let monacoEditor: any = null;
  let editorReady = false;
  let saving = false;
  let saveLabel = '';

  onMount(async () => {
    const loader = await import('@monaco-editor/loader');
    const monaco = await loader.default.init();
    monacoEditor = monaco.editor.create(editorContainer, {
      value: editorValue,
      language: 'yaml',
      theme: 'vs',
      fontSize: 13,
      lineNumbers: 'on',
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2
    });
    editorReady = true;
    return () => monacoEditor?.dispose();
  });

  function submitSave(e: SubmitEvent) {
    const form = e.target as HTMLFormElement;
    const yamlInput = form.elements.namedItem('yaml') as HTMLInputElement;
    if (monacoEditor) yamlInput.value = monacoEditor.getValue();
    saving = true;
  }
</script>

<svelte:head><title>Admin — CV Editor</title></svelte:head>

<div class="cv-editor-layout">
  <!-- Left: editor panel -->
  <div class="editor-panel">
    <div class="panel-header">
      <h1 class="page-title">CV Editor</h1>
      <div class="header-actions">
        <a class="btn btn-ghost" href="/api/cv/docx" download="resume.yaml">
          Current YAML ↓
        </a>
        <a class="btn btn-ghost" href="/" target="_blank">Preview ↗</a>
      </div>
    </div>

    {#if form?.error}
      <div class="alert-error">{form.error}</div>
    {/if}
    {#if form?.success}
      <div class="alert-success">Saved as version {form.versionId?.slice(0, 8)}…</div>
    {/if}

    <div class="editor-box" bind:this={editorContainer}></div>

    <form method="POST" action="?/save" use:enhance on:submit={submitSave} class="save-form">
      <input type="hidden" name="yaml" value="" />
      <input
        type="text"
        name="label"
        bind:value={saveLabel}
        placeholder="Version label (optional, e.g. '2025-04 data-science push')"
        class="label-input"
      />
      <button type="submit" class="btn btn-primary" disabled={!editorReady || saving}>
        {saving ? 'Saving…' : 'Save as new version'}
      </button>
    </form>

    <!-- Upload -->
    <details class="upload-details">
      <summary>Upload a YAML file instead</summary>
      <form method="POST" action="?/upload" use:enhance enctype="multipart/form-data" class="upload-form">
        <input type="file" name="file" accept=".yaml,.yml" required />
        <input type="text" name="label" placeholder="Version label (optional)" class="label-input" />
        <button type="submit" class="btn btn-secondary">Upload & activate</button>
      </form>
    </details>
  </div>

  <!-- Right: version history -->
  <aside class="version-panel">
    <h2>Version history</h2>
    {#if data.versions.length === 0}
      <p class="empty">No versions yet.</p>
    {:else}
      <ul class="version-list">
        {#each data.versions as v}
          <li class="version-item" class:current={v.is_current}>
            <div class="version-meta">
              <span class="version-id">{v.id.slice(0, 8)}…</span>
              {#if v.is_current}<span class="current-badge">current</span>{/if}
            </div>
            <p class="version-label">{v.label ?? '(no label)'}</p>
            <p class="version-date">{new Date(v.created_at).toLocaleString()}</p>
            <div class="version-actions">
              {#if !v.is_current}
                <form method="POST" action="?/restore" use:enhance>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" class="btn-link">Restore</button>
                </form>
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="id" value={v.id} />
                  <button type="submit" class="btn-link danger"
                    on:click={e => !confirm('Delete this version?') && e.preventDefault()}>
                    Delete
                  </button>
                </form>
              {/if}
              <!-- Download this version's YAML -->
              <a class="btn-link" href="/admin/api/cv?version={v.id}" download="resume_{v.id.slice(0,8)}.yaml">
                YAML ↓
              </a>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </aside>
</div>

<style>
  .cv-editor-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
    align-items: start;
  }

  .panel-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
  }
  .page-title { font-size: 20px; font-weight: 700; }
  .header-actions { display: flex; gap: 8px; }

  .editor-box {
    height: 600px;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
  }

  .save-form { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
  .label-input {
    flex: 1; padding: 7px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 13px;
  }

  .upload-details { margin-top: 16px; font-size: 13px; color: #555; }
  .upload-details summary { cursor: pointer; font-weight: 500; margin-bottom: 8px; }
  .upload-form { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 8px; }

  .alert-error { background: #fee2e2; color: #7f1d1d; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }
  .alert-success { background: #d1fae5; color: #064e3b; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }

  /* Version panel */
  .version-panel { background: white; border: 1px solid #e0ddd8; border-radius: 10px; padding: 16px; }
  .version-panel h2 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
  .version-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .version-item {
    padding: 10px;
    border-radius: 6px;
    background: #f9f8f5;
    border: 1px solid #e8e5e0;
    font-size: 12px;
  }
  .version-item.current { border-color: #1a4e8c; background: #eff6ff; }
  .version-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
  .version-id { font-family: monospace; color: #555; }
  .current-badge { background: #1a4e8c; color: white; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; }
  .version-label { font-weight: 500; color: #222; margin: 2px 0; }
  .version-date { color: #888; }
  .version-actions { display: flex; gap: 10px; margin-top: 6px; }
  .btn-link { background: none; border: none; padding: 0; font-size: 12px; color: #1a4e8c; cursor: pointer; font-family: inherit; }
  .btn-link:hover { text-decoration: underline; }
  .btn-link.danger { color: #b91c1c; }
  .empty { color: #999; font-size: 13px; }

  /* Buttons */
  .btn {
    padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: 1px solid transparent; text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: #1a4e8c; color: white; }
  .btn-secondary { background: white; color: #333; border-color: #ccc; }
  .btn-ghost { background: none; color: #1a4e8c; border-color: #c5d8ee; font-size: 12px; padding: 5px 10px; }
</style>
