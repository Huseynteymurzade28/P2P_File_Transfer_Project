import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { ArrowUpIcon, SendIcon } from './components/icons';
import path from 'path-browserify';
import './App.css';
import LanguageSelector from './components/LanguageSelector';

interface ElectronAPI {
  sendDownloadRequest: (fileName: string, savePath: string) => void;
  selectFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<string>('tr');
  const [texts, setTexts] = useState<Record<string, string>>({});

  const translations: Record<string, Record<string, string>> = {
    en: {
      title: 'P2P Transfer',
      subtitle: 'Peer-to-Peer File Transfer',
      searchPlaceholder: 'Search for a file...',
      dropText: 'Drag & drop a .txt file or click to select',
      dropInstruction: 'This file should contain the download list',
      selectedFileText: 'Selected',
      fileInputText: 'file entries',
      sendButtonText: 'Send Download Request',
      statusSelectFolderError: '❌ User did not select a folder.',
      statusDownloadRequestSent: '📨 Download request sent',
      statusSavePath: '💾 Save path',
      statusFilesDetected: '✅ {count} files detected. Click button to download.',
      statusTxtNotReadableError: '❌ .txt file could not be read.',
      statusTxtEmptyError: '❌ .txt file is empty or contains no valid file names.',
      statusOnlyTxtError: '❌ Please select only .txt files.',
      footerText: 'Files are transferred directly between peers. Not stored on a server.',
      alertEnterFileName: 'Please enter a file name.',
      alertMultiFileSent: '📨 Request sent for {count} files.',
      alertSaveFolder: '📁 Save Folder',
      alertMultiFileError: '❌ An error occurred during bulk sending.',
    },
    tr: {
      title: 'P2P Transfer',
      subtitle: 'Peer-to-Peer Dosya Aktarımı',
      searchPlaceholder: 'Bir dosya arayın...',
      dropText: 'Bir .txt dosyasını sürükle & bırak veya seç',
      dropInstruction: 'bu dosya indirme listesini içermeli',
      selectedFileText: 'Seçilen',
      fileInputText: 'dosya girdisi',
      sendButtonText: 'İndirme İsteği Gönder',
      statusSelectFolderError: '❌ Kullanıcı klasör seçmedi.',
      statusDownloadRequestSent: '📨 İndirme isteği gönderildi',
      statusSavePath: '💾 Kaydedildiği yer',
      statusFilesDetected: '✅ {count} dosya algılandı. İndirmek için butona tıklayın.',
      statusTxtNotReadableError: '❌ .txt dosyası okunamadı.',
      statusTxtEmptyError: '❌ .txt dosyası boş veya geçerli dosya ismi yok.',
      statusOnlyTxtError: '❌ Lütfen sadece .txt uzantılı dosya seçiniz.',
      footerText: 'Dosyalar doğrudan peerlar arasında aktarılır. Sunucuda depolanmaz.',
      alertEnterFileName: 'Lütfen bir dosya adı girin.',
      alertMultiFileSent: '📨 {count} dosya için istek gönderildi.',
      alertSaveFolder: '📁 Kaydedildiği Klasör',
      alertMultiFileError: '❌ Toplu gönderim sırasında bir hata oluştu.',
    },
  };

  useEffect(() => {
    setTexts(translations[language] || translations.tr);
  }, [language]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setSearchQuery('');
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'text/plain') {
      setStatus(texts.statusOnlyTxtError || 'Error: Please select only .txt files.');
      return;
    }

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        setStatus(texts.statusTxtEmptyError || 'Error: .txt file is empty.');
        return;
      }

      setFileNames(lines);
      setSelectedFile(file);
      setFileName('');
      setSearchQuery('');
      setStatus(
        (texts.statusFilesDetected || '✅ {count} files detected.').replace('{count}', lines.length.toString())
      );
    } catch (err) {
      console.error('Drop hatası:', err);
      setStatus(texts.statusTxtNotReadableError || 'Error: Could not read .txt file.');
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
    setSelectedFile(null);
    setFileName('');
    setFileNames([]);
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchQuery.trim()) {
      alert(texts.alertEnterFileName || 'Please enter a file name.');
      return;
    }

    const folderPath = await window.electronAPI.selectFolder();
    if (!folderPath) {
      setStatus(texts.statusSelectFolderError || 'Error: User did not select a folder.');
      return;
    }

    const fullSavePath = path.join(folderPath, searchQuery.trim());
    window.electronAPI.sendDownloadRequest(searchQuery.trim(), fullSavePath);
    setStatus(
      `${texts.statusDownloadRequestSent || 'Download request sent'}: ${searchQuery}\n${texts.statusSavePath || 'Save path'}: ${fullSavePath}`
    );
    setSelectedFile(null);
    setFileName('');
    setSearchQuery('');
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSendRequest = async (): Promise<void> => {
    const namesToSend = fileNames.length > 0 ? fileNames : [fileName.trim()];
    if (namesToSend.length === 0 || !namesToSend[0]) {
      alert(texts.alertEnterFileName || 'Please enter a file name.');
      return;
    }

    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (!folderPath) {
        setStatus(texts.statusSelectFolderError || 'Error: User did not select a folder.');
        return;
      }

      namesToSend.forEach((name) => {
        const savePath = `${folderPath}/${name}`;
        window.electronAPI.sendDownloadRequest(name, savePath);
      });

      setStatus(
        `${(texts.alertMultiFileSent || 'Request sent for {count} files.').replace(
          '{count}',
          namesToSend.length.toString()
        )}\n${texts.alertSaveFolder || 'Save Folder'}: ${folderPath}`
      );

      setSelectedFile(null);
      setFileName('');
      setFileNames([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Toplu gönderim hatası:', error);
      setStatus(texts.alertMultiFileError || 'Error: Bulk sending failed.');
    }
  };

  return (
    <div className="app-container">
      <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
      <div className="transfer-container">
        <h1 className="title">{texts.title || 'P2P Transfer'}</h1>
        <p className="subtitle">{texts.subtitle || 'Peer-to-Peer File Transfer'}</p>

        <div className="drop-area-container">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder={texts.searchPlaceholder || 'Search for a file...'}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div
            className="drop-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
          >
            <ArrowUpIcon />
            <p className="drop-text">{texts.dropText || 'Drag & drop a .txt file or click to select'}</p>
            <p className="drop-instruction">{texts.dropInstruction || 'This file should contain the download list'}</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".txt"
            />
            {selectedFile && (
              <p className="selected-file">
                {texts.selectedFileText || 'Selected'}: {selectedFile.name} ({fileNames.length} {texts.fileInputText || 'file entries'})
              </p>
            )}
          </div>
        </div>

        <button
          className="send-button"
          onClick={searchQuery.trim() ? handleSearch : handleSendRequest}
          disabled={
            !searchQuery.trim() &&
            !selectedFile &&
            !fileName.trim() &&
            fileNames.length === 0
          }
        >
          {texts.sendButtonText || 'Send Download Request'}
          <SendIcon />
        </button>

        {status && (
          <div className="status-container">
            <p className="status-text">{status}</p>
          </div>
        )}

        <p className="footer-text">
          {texts.footerText || 'Files are transferred directly between peers. Not stored on a server.'}
        </p>
      </div>
    </div>
  );
}