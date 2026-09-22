"use client";

import { FilterTabs, FilterTabOption } from "@/components/ui/filter-tabs";

export type DocumentFilterTab = "all" | "favorites" | "processing" | "failed";

export interface DocumentFilterTabsProps {
  activeTab: DocumentFilterTab;
  onTabChange: (tab: DocumentFilterTab) => void;
  className?: string;
}

const TAB_OPTIONS: FilterTabOption<DocumentFilterTab>[] = [
  { id: "all", label: "All documents" },
  { id: "favorites", label: "Favorites" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export function DocumentFilterTabs({
  activeTab,
  onTabChange,
  className,
}: DocumentFilterTabsProps) {
  return (
    <FilterTabs<DocumentFilterTab>
      options={TAB_OPTIONS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className}
    />
  );
}
