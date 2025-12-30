import { Loader2 } from 'lucide-react';

export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);