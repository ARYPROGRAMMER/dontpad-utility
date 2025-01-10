import React, { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
  const [content, setContent] = useState('');
  const [path, setPath] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentPath = window.location.pathname.slice(1) || 'index';
    setPath(currentPath);
    
    // Load content from Firebase
    const loadContent = async () => {
      try {
        const docRef = doc(db, 'notes', currentPath);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
          setLastSaved(new Date(docSnap.data().lastSaved));
        }
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    if (content === '') return;

    setIsSaving(true);
    const saveTimeout = setTimeout(async () => {
      try {
        const docRef = doc(db, 'notes', path);
        await setDoc(docRef, {
          content,
          lastSaved: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving content:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [content, path]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const navigateToPath = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('path') as HTMLInputElement;
    const newPath = input.value.trim();
    if (newPath) {
      window.location.href = `/${newPath}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">DontPad Clone Because I wont But it</h1>
          </div>
          <form onSubmit={navigateToPath} className="flex space-x-2">
            <input
              type="text"
              name="path"
              placeholder="Go to path..."
              className="px-3 py-1 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="submit"
              className="bg-indigo-500 px-4 py-1 rounded hover:bg-indigo-400 transition-colors"
            >
              Go
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg text-gray-700">
              Editing: <span className="font-mono text-indigo-600">/{path}</span>
            </h2>
            <div className="flex items-center space-x-2">
              {isSaving && (
                <div className="flex items-center text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </div>
              )}
              {lastSaved && !isSaving && (
                <p className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-250px)]">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-[calc(100vh-250px)] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono resize-none"
              placeholder="Start typing... Your text will be automatically saved"
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t py-2">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-600">
          <p>
            Just like DontPad, - no this is better | No Ads simply type any path in the URL to create/edit a note.
            Everything is saved automatically to Firebase.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;