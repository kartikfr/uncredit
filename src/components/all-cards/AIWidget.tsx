
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface AIWidgetProps {
  showAIWidget: boolean;
  onClose: () => void;
}

export const AIWidget = ({ showAIWidget, onClose }: AIWidgetProps) => {
  if (!showAIWidget) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-card border border-border rounded-lg shadow-elevated z-50">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClose}
        >
          ×
        </Button>
      </div>
      <div className="p-4 h-full flex items-center justify-center text-muted-foreground">
        AI chat interface would be implemented here
      </div>
    </div>
  );
};
