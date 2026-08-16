"use client";

export function CategoryTabs({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === tab ? "text-gold" : "text-white/45 hover:text-white/70"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gold" />
          )}
        </button>
      ))}
    </div>
  );
}
