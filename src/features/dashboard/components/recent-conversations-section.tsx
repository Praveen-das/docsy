import React from "react";
import { MessageSquare } from "lucide-react";
import { DashboardSectionHeader } from "./dashboard-section-header";
import { ConversationRow } from "./conversation-row";

export interface DashboardConversationItem {
  id: string;
  title: string;
  docName: string;
  docId: string;
  preview: string;
  timeText: string;
  isActive: boolean;
  isReal: boolean;
}

export interface RecentConversationsSectionProps {
  conversations: DashboardConversationItem[];
  onOpenConv: (convId: string, docId: string, isReal: boolean) => void;
}

export function RecentConversationsSection({ conversations, onOpenConv }: RecentConversationsSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <DashboardSectionHeader
        title="Recent Conversations"
        href="/conversations"
        icon={MessageSquare}
        viewAllHref="/conversations"
      />

      <div className="space-y-3">
        {conversations.map((conv) => (
          <ConversationRow
            key={conv.id}
            id={conv.id}
            title={conv.title}
            docName={conv.docName}
            preview={conv.preview}
            timeText={conv.timeText}
            onClick={() => onOpenConv(conv.id, conv.docId, conv.isReal)}
          />
        ))}
      </div>
    </div>
  );
}
