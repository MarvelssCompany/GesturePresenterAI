import JSZip from 'jszip';
import { SlideItem, SlideImage, SlideAudio } from '../types';

export async function parsePptxFile(file: File | Blob): Promise<SlideItem[]> {
  try {
    const zip = await JSZip.loadAsync(file);

    // 1. Extract all media files from ppt/media/
    const mediaMap: Record<string, { url: string; type: 'image' | 'audio' | 'other'; name: string }> = {};

    const mediaPromises: Promise<void>[] = [];
    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.startsWith('ppt/media/') && !zipEntry.dir) {
        const p = async () => {
          const fileName = relativePath.replace('ppt/media/', '');
          const lowerName = fileName.toLowerCase();

          let mime = 'application/octet-stream';
          let type: 'image' | 'audio' | 'other' = 'other';

          if (lowerName.endsWith('.png')) {
            mime = 'image/png';
            type = 'image';
          } else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
            mime = 'image/jpeg';
            type = 'image';
          } else if (lowerName.endsWith('.svg')) {
            mime = 'image/svg+xml';
            type = 'image';
          } else if (lowerName.endsWith('.gif')) {
            mime = 'image/gif';
            type = 'image';
          } else if (lowerName.endsWith('.webp')) {
            mime = 'image/webp';
            type = 'image';
          } else if (lowerName.endsWith('.mp3')) {
            mime = 'audio/mpeg';
            type = 'audio';
          } else if (lowerName.endsWith('.wav')) {
            mime = 'audio/wav';
            type = 'audio';
          } else if (lowerName.endsWith('.m4a')) {
            mime = 'audio/mp4';
            type = 'audio';
          } else if (lowerName.endsWith('.ogg')) {
            mime = 'audio/ogg';
            type = 'audio';
          }

          try {
            const blob = await zipEntry.async('blob');
            const url = URL.createObjectURL(new Blob([blob], { type: mime }));
            mediaMap[fileName] = { url, type, name: fileName };
            // Also store with ../media/ prefix as often referenced in rels
            mediaMap[`../media/${fileName}`] = { url, type, name: fileName };
            mediaMap[`media/${fileName}`] = { url, type, name: fileName };
          } catch (e) {
            console.warn('Could not read media file:', fileName, e);
          }
        };
        mediaPromises.push(p());
      }
    });

    await Promise.all(mediaPromises);

    // 2. Find and sort all slide XML files
    const slideFiles: string[] = [];
    zip.forEach((relativePath) => {
      const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
      if (match) {
        slideFiles.push(relativePath);
      }
    });

    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
      return numA - numB;
    });

    if (slideFiles.length === 0) {
      throw new Error('Tidak ada slide yang ditemukan dalam file PowerPoint (.pptx).');
    }

    const slides: SlideItem[] = [];
    const parser = new DOMParser();

    for (let i = 0; i < slideFiles.length; i++) {
      const filePath = slideFiles[i];
      const slideNum = filePath.match(/slide(\d+)\.xml/)?.[1] || `${i + 1}`;
      const slideXmlStr = await zip.file(filePath)?.async('text');
      if (!slideXmlStr) continue;

      const xmlDoc = parser.parseFromString(slideXmlStr, 'text/xml');

      // 3. Load slide relationships (_rels/slide{N}.xml.rels) to resolve images & media
      const relsFilePath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
      const relsXmlStr = await zip.file(relsFilePath)?.async('text');
      const relMap: Record<string, string> = {}; // rId -> target

      if (relsXmlStr) {
        const relsDoc = parser.parseFromString(relsXmlStr, 'text/xml');
        const relNodes = relsDoc.getElementsByTagName('Relationship');
        for (let r = 0; r < relNodes.length; r++) {
          const id = relNodes[r].getAttribute('Id') || '';
          const target = relNodes[r].getAttribute('Target') || '';
          if (id && target) {
            relMap[id] = target;
          }
        }
      }

      // 4. Extract Images linked in this slide
      const slideImages: SlideImage[] = [];
      const picNodes = xmlDoc.getElementsByTagName('p:pic');
      for (let p = 0; p < picNodes.length; p++) {
        const blip = picNodes[p].getElementsByTagName('a:blip')[0];
        const embedId = blip?.getAttribute('r:embed');
        if (embedId && relMap[embedId]) {
          const targetPath = relMap[embedId];
          const mediaObj = mediaMap[targetPath] ||
            Object.values(mediaMap).find((m) => targetPath.endsWith(m.name));

          if (mediaObj && mediaObj.type === 'image') {
            slideImages.push({
              id: `img-${slideNum}-${p}`,
              url: mediaObj.url,
              name: mediaObj.name,
              alt: `Gambar Slide ${slideNum}`,
            });
          }
        }
      }

      // 5. Extract Audio/Sound linked in this slide
      let slideAudio: SlideAudio | undefined = undefined;
      const audioNodes = xmlDoc.querySelectorAll('a\\:audioFile, p\\:audioFile');
      for (let a = 0; a < audioNodes.length; a++) {
        const linkId = audioNodes[a].getAttribute('r:link') || audioNodes[a].getAttribute('r:embed');
        if (linkId && relMap[linkId]) {
          const target = relMap[linkId];
          const mediaObj = mediaMap[target] ||
            Object.values(mediaMap).find((m) => target.endsWith(m.name) && m.type === 'audio');
          if (mediaObj) {
            slideAudio = {
              id: `audio-${slideNum}`,
              url: mediaObj.url,
              title: mediaObj.name,
            };
            break;
          }
        }
      }

      // 6. Extract Tables (<a:tbl>)
      const tableNodes = xmlDoc.getElementsByTagName('a:tbl');
      const tables: Array<{ headers: string[]; rows: string[][] }> = [];

      for (let t = 0; t < tableNodes.length; t++) {
        const rowNodes = tableNodes[t].getElementsByTagName('a:tr');
        if (rowNodes.length > 0) {
          const tableRows: string[][] = [];
          for (let r = 0; r < rowNodes.length; r++) {
            const cellNodes = rowNodes[r].getElementsByTagName('a:tc');
            const rowCells: string[] = [];
            for (let c = 0; c < cellNodes.length; c++) {
              const cellTextNodes = cellNodes[c].getElementsByTagName('a:t');
              let cellText = '';
              for (let ct = 0; ct < cellTextNodes.length; ct++) {
                cellText += cellTextNodes[ct].textContent || '';
              }
              rowCells.push(cellText.trim());
            }
            tableRows.push(rowCells);
          }

          if (tableRows.length > 0) {
            tables.push({
              headers: tableRows[0],
              rows: tableRows.slice(1),
            });
          }
        }
      }

      // 7. Extract Paragraphs / Text
      const paragraphs = xmlDoc.getElementsByTagName('a:p');
      const textLines: string[] = [];

      for (let p = 0; p < paragraphs.length; p++) {
        const pNode = paragraphs[p];
        const textNodes = pNode.getElementsByTagName('a:t');
        let lineText = '';
        for (let t = 0; t < textNodes.length; t++) {
          lineText += textNodes[t].textContent || '';
        }
        lineText = lineText.trim();
        if (lineText) {
          textLines.push(lineText);
        }
      }

      // 8. Extract Notes in ppt/notesSlides/notesSlide{N}.xml
      let notes = '';
      const notesPath = `ppt/notesSlides/notesSlide${slideNum}.xml`;
      const notesXml = await zip.file(notesPath)?.async('text');
      if (notesXml) {
        const notesDoc = parser.parseFromString(notesXml, 'text/xml');
        const noteParas = notesDoc.getElementsByTagName('a:p');
        const noteLines: string[] = [];
        for (let np = 0; np < noteParas.length; np++) {
          const tNodes = noteParas[np].getElementsByTagName('a:t');
          let nText = '';
          for (let nt = 0; nt < tNodes.length; nt++) {
            nText += tNodes[nt].textContent || '';
          }
          if (nText.trim()) noteLines.push(nText.trim());
        }
        notes = noteLines.join('\n');
      }

      // 9. Detect Transition / Animation
      let animationType: 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'flip' = 'fade';
      const transitionNode = xmlDoc.getElementsByTagName('p:transition')[0];
      if (transitionNode) {
        if (transitionNode.getElementsByTagName('p:push').length > 0) animationType = 'slide-left';
        else if (transitionNode.getElementsByTagName('p:zoom').length > 0) animationType = 'zoom';
        else if (transitionNode.getElementsByTagName('p:wipe').length > 0) animationType = 'slide-up';
        else if (transitionNode.getElementsByTagName('p:split').length > 0) animationType = 'flip';
        else animationType = 'fade';
      } else {
        // Aesthetic alternating transitions
        const anims: Array<'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'flip'> = [
          'fade',
          'slide-up',
          'slide-left',
          'zoom',
          'flip',
        ];
        animationType = anims[i % anims.length];
      }

      const title = textLines[0] || `Slide ${i + 1}`;
      const bullets = textLines.slice(1);

      slides.push({
        id: i + 1,
        slideNumber: i + 1,
        title,
        bullets: bullets.length > 0 ? bullets : ['Tidak ada poin teks tambahan pada slide ini.'],
        notes: notes || undefined,
        rawText: textLines.join('\n'),
        themeColor: getThemeColorForIndex(i),
        images: slideImages.length > 0 ? slideImages : undefined,
        audio: slideAudio,
        audioUrl: slideAudio?.url,
        animationType,
        tables: tables.length > 0 ? tables : undefined,
      });
    }

    return slides;
  } catch (error: any) {
    console.error('Failed to parse PPTX:', error);
    throw new Error(error.message || 'File PowerPoint (.pptx) tidak valid atau rusak.');
  }
}

function getThemeColorForIndex(index: number): string {
  const gradients = [
    'from-indigo-950 via-slate-900 to-slate-950',
    'from-blue-950 via-slate-900 to-slate-950',
    'from-violet-950 via-slate-900 to-slate-950',
    'from-cyan-950 via-slate-900 to-slate-950',
    'from-emerald-950 via-slate-900 to-slate-950',
  ];
  return gradients[index % gradients.length];
}
