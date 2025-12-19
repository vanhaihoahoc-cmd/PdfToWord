
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'https://esm.sh/docx';

export const generateDocx = async (content: string, fileName: string): Promise<Blob> => {
  // Split content by double newlines to identify paragraphs or sections
  const sections = content.split('\n');
  
  const paragraphs = sections.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Basic heuristic: check if it's likely a heading
    const isHeading = trimmed.length < 100 && (trimmed.toUpperCase() === trimmed || /^[0-9\.]+\s/.test(trimmed));

    return new Paragraph({
      children: [
        new TextRun({
          text: trimmed,
          bold: isHeading,
          size: isHeading ? 32 : 24,
        }),
      ],
      heading: isHeading ? HeadingLevel.HEADING_1 : undefined,
      spacing: {
        after: 200,
      },
    });
  }).filter(p => p !== null) as Paragraph[];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};
