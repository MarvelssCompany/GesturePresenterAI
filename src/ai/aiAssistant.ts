import { AIAnalysisData, MaterialData } from '../types';

export async function analyzeMaterialWithAI(material: MaterialData): Promise<AIAnalysisData> {
  const payload = {
    type: material.type,
    title: material.title,
    contentText: material.type === 'pptx'
      ? material.slides?.map((s) => `Slide ${s.slideNumber}: ${s.title}\n${s.bullets.join('\n')}\nNotes: ${s.notes || ''}`).join('\n\n')
      : material.sections?.map((sec) => `Section ${sec.sectionNumber}: ${sec.title}\n${sec.paragraphs.join('\n')}\n${sec.bullets.join('\n')}`).join('\n\n'),
    slidesOrSections: material.type === 'pptx'
      ? material.slides?.map((s) => ({ title: s.title, text: s.rawText }))
      : material.sections?.map((sec) => ({ title: sec.title, text: sec.rawText })),
  };

  try {
    const res = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server returned ${res.status}`);
    }

    const data = await res.json();
    if (!data.analysis || !data.analysis.summary) {
      throw new Error('Incomplete AI analysis response.');
    }

    return {
      ...data.analysis,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('AI analysis request failed:', error);
    throw error;
  }
}

export async function askAIAssistant(params: {
  materialContext: string;
  currentSlideContext?: string;
  currentSlideIndex?: number;
  question: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server returned ${res.status}`);
    }

    const data = await res.json();
    return data.answer || 'No answer received from AI.';
  } catch (error: any) {
    console.error('Ask AI error:', error);
    throw error;
  }
}
