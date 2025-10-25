import { useState } from 'react';
import EmptyState from '../EmptyState';

export default function EmptyStateExample() {
  const [selectedQuery, setSelectedQuery] = useState<string>("");

  const handleQuerySelect = (query: string) => {
    console.log('Query selected:', query);
    setSelectedQuery(query);
  };

  return (
    <div>
      <EmptyState onQuerySelect={handleQuerySelect} />
      {selectedQuery && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto p-4 bg-card rounded-lg border border-card-border">
          <p className="text-sm text-muted-foreground">Selected query:</p>
          <p className="text-card-foreground font-medium">{selectedQuery}</p>
        </div>
      )}
    </div>
  );
}
