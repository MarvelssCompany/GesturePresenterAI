import React from 'react';
import { Layers, FileText, Play, Trash2, Calendar, HardDrive } from 'lucide-react';
import { MaterialData } from '../types';
import { WebsiteTheme, DEFAULT_WEBSITE_THEME, WEBSITE_THEMES } from '../data/websiteThemes';
import { useLanguage } from '../i18n/LanguageContext';

interface MyMaterialsViewProps {
  materials: MaterialData[];
  onStartPresentation: (material: MaterialData) => void;
  onDeleteMaterial: (id: string) => void;
  theme?: WebsiteTheme;
}

export const MyMaterialsView: React.FC<MyMaterialsViewProps> = ({
  materials,
  onStartPresentation,
  onDeleteMaterial,
  theme,
}) => {
  const activeTheme = theme || WEBSITE_THEMES[DEFAULT_WEBSITE_THEME];
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          activeTheme.isLight ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3 ${activeTheme.headingColor}`}>
            <Layers className="w-7 h-7" style={{ color: activeTheme.primaryColor }} />
            {isEn ? 'My Materials' : 'Materi Saya'}
          </h1>
          <p className={`text-sm mt-1 ${activeTheme.textMuted}`}>
            {isEn
              ? 'Your collection of PowerPoint (.pptx) presentation decks and Microsoft Word (.docx) documents.'
              : 'Koleksi file presentasi PowerPoint (.pptx) dan dokumen Microsoft Word (.docx) Anda.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between space-y-4 group transition duration-200 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${activeTheme.primaryColor}18`,
                    borderColor: `${activeTheme.primaryColor}40`,
                    color: activeTheme.primaryColor,
                  }}
                >
                  {item.type.toUpperCase()}
                </span>
                <span className={`text-xs font-mono flex items-center gap-1 ${activeTheme.textMuted}`}>
                  <Calendar className="w-3 h-3" />
                  {item.createdAt}
                </span>
              </div>

              <h3 className={`text-base font-bold line-clamp-2 leading-snug transition ${activeTheme.headingColor}`}>
                {item.title}
              </h3>
              <p className={`text-xs mt-1 truncate ${activeTheme.textMuted}`}>
                {item.fileName}
              </p>
            </div>

            <div
              className={`pt-4 border-t flex items-center justify-between text-xs ${
                activeTheme.isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <HardDrive className="w-3 h-3 text-slate-400" />
                {item.totalItems} {item.type === 'pptx' ? (isEn ? 'slides' : 'slide') : (isEn ? 'sections' : 'bab')} &bull; {item.fileSize}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStartPresentation(item)}
                  title={isEn ? 'Start Presentation' : 'Mulai Presentasi'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${activeTheme.accentBtn}`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isEn ? 'Start' : 'Mulai'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
