import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2">
    <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="search"
      className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      placeholder={placeholder ?? 'Search'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
