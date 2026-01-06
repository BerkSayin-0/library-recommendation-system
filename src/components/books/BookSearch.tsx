import React, { useState } from 'react';

export interface SearchFilters {
  genre: string;
  rating: string;
  year: string;
}

interface BookSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  availableGenres: string[];
}

export function BookSearch({ onSearch, availableGenres }: BookSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, { genre, rating, year });
  };

  return (
    <div className="glass-effect rounded-2xl p-6 border border-white/20 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search Bar Bölümü */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books by title, author, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-12"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="btn-gradient px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="input-modern"
            >
              <option value="">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="input-modern"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
              <option value="2.0">2.0+ Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Year Range</label>
            <input
              type="text"
              placeholder="e.g. 2020-2025 or 2024"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input-modern"
            />
            <p className="text-[10px] text-slate-400 mt-1 italic">
              Use '-' for range (e.g. 2020-2025)
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
