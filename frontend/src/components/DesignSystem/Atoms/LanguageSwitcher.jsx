import { useLanguage } from '../hooks/useLanguage';

export default function LanguageSwitcher() {
  const { lang, switchLang, t } = useLanguage();

  const languages = [
    { code: 'en', label: t('lang_en') },
    { code: 'hi', label: t('lang_hi') },
    { code: 'mr', label: t('lang_mr') },
    { code: 'ta', label: t('lang_ta') },
    { code: 'bn', label: t('lang_bn') },
  ];

  return (
    <div className="lang-pill">
      {languages.map((l) => (
        <button
          key={l.code}
          className={lang === l.code ? 'active' : ''}
          onClick={() => switchLang(l.code)}
          aria-label={`Switch to ${l.code}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
