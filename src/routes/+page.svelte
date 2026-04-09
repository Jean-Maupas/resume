<script lang="ts">
  import type { PageData } from './$types';
  import ProfileFilter from '$components/ProfileFilter.svelte';
  import CVSection from '$components/CVSection.svelte';
  import WorkEntry from '$components/WorkEntry.svelte';
  import ExportBar from '$components/ExportBar.svelte';

  export let data: PageData;
  $: ({ resume, allProfiles, activeProfile } = data);
  $: summary = resume.basics.summaries[0]?.text ?? '';
</script>

<svelte:head>
  <title>{resume.basics.name} — CV</title>
  <meta name="description" content="{resume.basics.name}, {resume.basics.summaries[0]?.text?.slice(0, 120) ?? ''}" />
</svelte:head>

<div class="page-shell no-print">
  <ProfileFilter profiles={allProfiles} active={activeProfile} />
  <ExportBar name={resume.basics.name} profile={activeProfile} />
</div>

<main class="cv-page">
  <!-- Header -->
  <header class="cv-header">
    <h1>{resume.basics.name}{resume.basics.suffix ? `, ${resume.basics.suffix}` : ''}</h1>
    <p class="cv-location">{resume.basics.location.city}, {resume.basics.location.region}</p>
    <div class="cv-contacts">
      <a href="mailto:{resume.basics.email}">{resume.basics.email}</a>
      <span class="sep">·</span>
      <a href="tel:{resume.basics.phone}">{resume.basics.phone}</a>
      {#each resume.basics.profiles as p}
        <span class="sep">·</span>
        <a href="{p.url}" target="_blank" rel="noopener">{p.network}</a>
      {/each}
    </div>
  </header>

  <!-- Summary -->
  {#if summary}
    <CVSection title="Profile & Summary" openByDefault>
      <p class="summary-text">{summary}</p>
    </CVSection>
  {/if}

  <!-- Competencies -->
  {#if resume.competencies.length}
    <CVSection title="Key Competencies" openByDefault>
      {#each resume.competencies as comp}
        <div class="competency">
          <h3 class="comp-title">{comp.area}</h3>
          <ul>
            {#each comp.highlights as h}
              <li>{h.text}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </CVSection>
  {/if}

  <!-- Experience -->
  <CVSection title="Professional Experience" openByDefault>
    {#each resume.work as job}
      <WorkEntry {job} />
    {/each}
  </CVSection>

  <!-- Education -->
  <CVSection title="Education">
    {#each resume.education as edu}
      <div class="edu-entry">
        <div class="edu-header">
          <span class="edu-degree">{edu.studyType} — {edu.area}</span>
          {#if edu.location}<span class="edu-loc">{edu.location}</span>{/if}
        </div>
        {#if edu.url}
          <a class="company-link" href="{edu.url}" target="_blank" rel="noopener">{edu.institution}</a>
        {:else}
          <span>{edu.institution}</span>
        {/if}
        {#if edu.note}<p class="edu-note">{edu.note}</p>{/if}
      </div>
    {/each}
  </CVSection>

  <!-- Certifications -->
  {#if resume.certificates.length}
    <CVSection title="Professional Certifications">
      <ul>
        {#each resume.certificates as cert}
          <li>
            {#if cert.url}
              <a href="{cert.url}" target="_blank" rel="noopener">{cert.name}</a>
            {:else}
              {cert.name}
            {/if}
            — {cert.issuer}{cert.date ? ` (${cert.date})` : ''}
          </li>
        {/each}
      </ul>
    </CVSection>
  {/if}

  <!-- Skills -->
  {#if resume.skills.length}
    <CVSection title="Technical Skills">
      {#each resume.skills as group}
        <div class="skill-group">
          <h3 class="skill-group-name">{group.name}</h3>
          <p class="skill-keywords">{group.keywords.join(' · ')}</p>
        </div>
      {/each}
    </CVSection>
  {/if}

  <!-- Publications -->
  {#if resume.publications.length}
    <CVSection title="Publications">
      {#each resume.publications as pub}
        <p>
          {#if pub.url}
            <a href="{pub.url}" target="_blank" rel="noopener">{pub.name}</a>
          {:else}
            {pub.name}
          {/if}
          {#if pub.note}<span class="pub-note"> — {pub.note}</span>{/if}
        </p>
      {/each}
    </CVSection>
  {/if}

  <!-- Languages & Citizenships -->
  <CVSection title="Languages & Citizenships">
    <p><strong>Languages:</strong> {resume.languages.map(l => `${l.language} (${l.fluency})`).join(', ')}</p>
    <p><strong>Citizenships:</strong> {resume.citizenships.join(', ')}</p>
  </CVSection>
</main>

<style>
  .page-shell {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f5f4f0;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 24px;
    flex-wrap: wrap;
  }

  .cv-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    background: white;
    min-height: 100vh;
  }

  .cv-header { margin-bottom: 24px; }
  h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.3px; }
  .cv-location { color: #555; font-size: 13px; margin: 2px 0 6px; }
  .cv-contacts { font-size: 13px; color: #333; }
  .sep { margin: 0 4px; color: #aaa; }

  .summary-text { line-height: 1.75; }

  .competency { margin-bottom: 14px; }
  .comp-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #222; }
  .competency ul { padding-left: 18px; }
  .competency li { font-size: 13.5px; margin-bottom: 3px; }

  .edu-entry { margin-bottom: 14px; }
  .edu-header { display: flex; justify-content: space-between; }
  .edu-degree { font-weight: 600; font-size: 14px; }
  .edu-loc { font-size: 12px; color: #666; }
  .edu-note { font-size: 13px; color: #555; margin-top: 2px; }

  .skill-group { margin-bottom: 10px; }
  .skill-group-name { font-size: 13px; font-weight: 700; color: #222; }
  .skill-keywords { font-size: 13px; color: #444; margin-top: 2px; }

  .pub-note { color: #555; }
</style>
