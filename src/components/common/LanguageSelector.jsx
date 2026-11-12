import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function LanguageSelector({ variant = 'outline' }) {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2);

  const choose = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="inline-flex rounded-full border border-[#2B1741]/20 bg-white/80 p-0.5" role="group" aria-label="Idioma">
      {['es', 'en'].map((code) => (
        <Button
          key={code}
          type="button"
          size="sm"
          variant={current === code ? 'default' : variant}
          className="h-8 min-h-0 rounded-full px-3 text-xs"
          onClick={() => choose(code)}
        >
          {code.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
