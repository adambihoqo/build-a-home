import { useState } from 'react';
import { HomePage } from './HomePage';
import { EditorPage } from './EditorPage';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  if (currentProjectId) {
    return (
      <EditorPage
        projectId={currentProjectId}
        onBack={() => setCurrentProjectId(null)}
      />
    );
  }

  return <HomePage onOpenProject={setCurrentProjectId} />;
}
