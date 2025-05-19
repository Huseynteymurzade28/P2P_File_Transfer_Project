import React from 'react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="language-selector">
      <button
        onClick={() => onLanguageChange('en')}
        className={currentLanguage === 'en' ? 'active' : ''}
      >
        🇺🇸 English
      </button>
      <button
        onClick={() => onLanguageChange('tr')}
        className={currentLanguage === 'tr' ? 'active' : ''}
      >
        🇹🇷 Türkçe
      </button>
    </div>
  );
};

export default LanguageSelector;
