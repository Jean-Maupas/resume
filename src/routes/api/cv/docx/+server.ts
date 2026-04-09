import type { RequestHandler } from '@sveltejs/kit';
import { getCurrentVersion } from '$db/cv';
import { filterByProfile, isValidProfileId } from '$cv/filter';
import type { ProfileId, ResumeSchema } from '$cv/schema';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, ExternalHyperlink,
  BorderStyle, WidthType, SectionType
} from 'docx';

export const GET: RequestHandler = async ({ url }) => {
  const version = await getCurrentVersion();
  if (!version) return new Response('No CV published', { status: 503 });

  const rawProfile = url.searchParams.get('profile');
  const profileId: ProfileId | null =
    rawProfile && isValidProfileId(rawProfile, version.parsed_json) ? rawProfile : null;

  const resume = filterByProfile(version.parsed_json, profileId);
  const buffer = await buildDocx(resume);

  const filename = `${resume.basics.name.replace(/\s+/g, '_')}_CV${profileId ? `_${profileId}` : ''}.docx`;

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
};

// ── DOCX builder ─────────────────────────────────────────────────────────────

function hr(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1a4e8c', space: 1 } },
    spacing: { after: 160 }
  });
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: '1a4e8c', font: 'Arial' })],
    spacing: { before: 280, after: 80 }
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'cv-bullets', level: 0 },
    children: [new TextRun({ text, size: 20, font: 'Arial' })],
    spacing: { after: 40 }
  });
}

async function buildDocx(resume: ResumeSchema): Promise<Buffer> {
  const basics = resume.basics;
  const children: Paragraph[] = [];

  // Header
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `${basics.name}${basics.suffix ? `, ${basics.suffix}` : ''}`, bold: true, size: 32, font: 'Arial' })]
  }));

  const contactParts = [
    `${basics.location.city}, ${basics.location.region}`,
    basics.phone,
    basics.email,
    ...basics.profiles.map(p => p.url)
  ];
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: contactParts.join('  ·  '), size: 18, font: 'Arial', color: '444444' })]
  }));

  // Summary
  const summary = basics.summaries[0]?.text;
  if (summary) {
    children.push(sectionHeading('Profile & Summary'), hr());
    children.push(new Paragraph({
      children: [new TextRun({ text: summary.replace(/\s+/g, ' ').trim(), size: 20, font: 'Arial' })],
      spacing: { after: 120 }
    }));
  }

  // Competencies
  if (resume.competencies.length) {
    children.push(sectionHeading('Key Competencies'), hr());
    for (const comp of resume.competencies) {
      children.push(new Paragraph({
        children: [new TextRun({ text: comp.area, bold: true, size: 20, font: 'Arial' })],
        spacing: { before: 80, after: 40 }
      }));
      for (const h of comp.highlights) children.push(bullet(h.text));
    }
  }

  // Work
  children.push(sectionHeading('Professional Experience'), hr());
  for (const job of resume.work) {
    children.push(new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [
        new TextRun({ text: job.name, bold: true, size: 22, font: 'Arial' }),
        new TextRun({ text: `  ${job.startDate} – ${job.endDate}`, size: 20, font: 'Arial', color: '666666' })
      ]
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: job.position, italics: true, size: 20, font: 'Arial' })],
      spacing: { after: 60 }
    }));
    for (const h of job.highlights) children.push(bullet(h.text));
  }

  // Education
  children.push(sectionHeading('Education'), hr());
  for (const edu of resume.education) {
    children.push(new Paragraph({
      spacing: { before: 80, after: 20 },
      children: [
        new TextRun({ text: `${edu.studyType} — ${edu.area}`, bold: true, size: 20, font: 'Arial' }),
        new TextRun({ text: edu.location ? `  ·  ${edu.location}` : '', size: 18, font: 'Arial', color: '666666' })
      ]
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: edu.institution, size: 20, font: 'Arial' })],
      spacing: { after: 40 }
    }));
  }

  // Skills
  if (resume.skills.length) {
    children.push(sectionHeading('Technical Skills'), hr());
    for (const group of resume.skills) {
      children.push(new Paragraph({
        spacing: { before: 60, after: 20 },
        children: [
          new TextRun({ text: `${group.name}:  `, bold: true, size: 20, font: 'Arial' }),
          new TextRun({ text: group.keywords.join(' · '), size: 20, font: 'Arial' })
        ]
      }));
    }
  }

  // Certifications
  if (resume.certificates.length) {
    children.push(sectionHeading('Certifications'), hr());
    for (const cert of resume.certificates) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${cert.name} — ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`, size: 20, font: 'Arial' })],
        numbering: { reference: 'cv-bullets', level: 0 },
        spacing: { after: 40 }
      }));
    }
  }

  // Languages & Citizenships
  children.push(sectionHeading('Languages & Citizenships'), hr());
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'Languages:  ', bold: true, size: 20, font: 'Arial' }),
      new TextRun({ text: resume.languages.map(l => `${l.language} (${l.fluency})`).join(', '), size: 20, font: 'Arial' })
    ], spacing: { after: 60 }
  }));
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'Citizenships:  ', bold: true, size: 20, font: 'Arial' }),
      new TextRun({ text: resume.citizenships.join(', '), size: 20, font: 'Arial' })
    ]
  }));

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'cv-bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      }]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 } } },
      paragraphStyles: [
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
          run: { size: 22, bold: true, font: 'Arial', color: '1a4e8c' },
          paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } }
      ]
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } }
      },
      children
    }]
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
