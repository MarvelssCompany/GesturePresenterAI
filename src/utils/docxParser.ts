import mammoth from 'mammoth';
import { DocSection } from '../types';

export async function parseDocxFile(file: File | Blob): Promise<DocSection[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Convert with image preservation
    const options = {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read('base64').then((imageBuffer) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`,
          };
        });
      }),
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    const html = result.value;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const sections: DocSection[] = [];
    const children = Array.from(doc.body.children);

    let currentTitle = 'Pengantar Dokumen';
    let currentParagraphs: string[] = [];
    let currentBullets: string[] = [];
    let currentHtmlParts: string[] = [];
    let currentImages: Array<{ url: string; alt?: string; caption?: string }> = [];
    let currentTables: Array<{ headers: string[]; rows: string[][] }> = [];
    let sectionCount = 0;

    const flushSection = () => {
      if (
        currentParagraphs.length > 0 ||
        currentBullets.length > 0 ||
        currentHtmlParts.length > 0 ||
        sections.length === 0
      ) {
        sectionCount++;
        sections.push({
          id: sectionCount,
          sectionNumber: sectionCount,
          title: currentTitle,
          paragraphs: [...currentParagraphs],
          bullets: [...currentBullets],
          richHtml: currentHtmlParts.length > 0 ? currentHtmlParts.join('') : undefined,
          images: currentImages.length > 0 ? [...currentImages] : undefined,
          tables: currentTables.length > 0 ? [...currentTables] : undefined,
          rawText: `${currentTitle}\n${currentParagraphs.join('\n')}\n${currentBullets.join('\n')}`,
        });
        currentParagraphs = [];
        currentBullets = [];
        currentHtmlParts = [];
        currentImages = [];
        currentTables = [];
      }
    };

    if (children.length === 0) {
      // Fallback
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
      const rawLines = rawTextResult.value
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      for (let i = 0; i < rawLines.length; i += 5) {
        const chunk = rawLines.slice(i, i + 5);
        sections.push({
          id: sections.length + 1,
          sectionNumber: sections.length + 1,
          title: i === 0 ? chunk[0] || 'Bab 1' : `Bab ${sections.length + 1}`,
          paragraphs: i === 0 ? chunk.slice(1) : chunk,
          bullets: [],
          richHtml: chunk.map((c) => `<p>${c}</p>`).join(''),
          rawText: chunk.join('\n'),
        });
      }
    } else {
      children.forEach((child) => {
        const tagName = child.tagName.toLowerCase();

        // Check for images inside child
        const imgElements = Array.from(child.querySelectorAll('img'));
        imgElements.forEach((img) => {
          const src = img.getAttribute('src');
          if (src) {
            currentImages.push({
              url: src,
              alt: img.getAttribute('alt') || 'Gambar Dokumen',
            });
          }
        });

        // Check for tables
        if (tagName === 'table') {
          const trs = Array.from(child.querySelectorAll('tr'));
          if (trs.length > 0) {
            const tableRows: string[][] = [];
            trs.forEach((tr) => {
              const cells = Array.from(tr.querySelectorAll('th, td')).map(
                (c) => c.textContent?.trim() || ''
              );
              tableRows.push(cells);
            });
            if (tableRows.length > 0) {
              currentTables.push({
                headers: tableRows[0],
                rows: tableRows.slice(1),
              });
            }
          }
        }

        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
          if (currentParagraphs.length > 0 || currentBullets.length > 0 || currentHtmlParts.length > 0) {
            flushSection();
          }
          currentTitle = child.textContent?.trim() || `Bab ${sectionCount + 1}`;
          currentHtmlParts.push(child.outerHTML);
        } else if (tagName === 'ul' || tagName === 'ol') {
          const listItems = Array.from(child.querySelectorAll('li'))
            .map((li) => li.textContent?.trim() || '')
            .filter(Boolean);
          currentBullets.push(...listItems);
          currentHtmlParts.push(child.outerHTML);
        } else {
          const text = child.textContent?.trim();
          if (text) {
            currentParagraphs.push(text);
          }
          currentHtmlParts.push(child.outerHTML);
        }

        // Auto-split very long sections (> 8 paragraphs) so reading view is clean
        if (currentParagraphs.length >= 6) {
          flushSection();
          currentTitle = `${currentTitle} (Lanjutan)`;
        }
      });

      flushSection();
    }

    if (sections.length === 0) {
      sections.push({
        id: 1,
        sectionNumber: 1,
        title: 'Isi Dokumen',
        paragraphs: ['Tidak ada teks yang dapat dibaca di dokumen Word ini.'],
        bullets: [],
        richHtml: '<p>Tidak ada teks yang dapat dibaca di dokumen Word ini.</p>',
        rawText: 'Tidak ada teks yang dapat dibaca di dokumen Word ini.',
      });
    }

    return sections;
  } catch (error: any) {
    console.error('Failed to parse DOCX:', error);
    throw new Error(error.message || 'File Word (.docx) tidak valid atau rusak.');
  }
}
