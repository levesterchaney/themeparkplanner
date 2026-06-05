'use client';

import React, { useState, useMemo } from 'react';
import { AttractionDetailResponseData } from '@/services/park';
import { Button, Textbox } from '@/components';

interface AttractionSelectorProps {
  attractions: AttractionDetailResponseData[];
  selectedAttractions: string[];
  onSelectionChange: (attractionIds: string[]) => void;
  mode: 'must-do' | 'skip';
  maxSelections?: number;
  className?: string;
}

export default function AttractionSelector({
  attractions,
  selectedAttractions,
  onSelectionChange,
  mode,
  maxSelections,
  className = '',
}: AttractionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterThrillLevel, setFilterThrillLevel] = useState<string>('all');
  const [filterKidFriendly, setFilterKidFriendly] = useState<string>('all');

  // Get unique values for filters
  const attractionTypes = useMemo(() => {
    const types = new Set(attractions.map((a) => a.type).filter(Boolean));
    return Array.from(types).sort();
  }, [attractions]);

  const thrillLevels = useMemo(() => {
    const levels = new Set(
      attractions.map((a) => a.thrill_level).filter(Boolean)
    );
    return Array.from(levels).sort();
  }, [attractions]);

  // Filter attractions based on search and filters
  const filteredAttractions = useMemo(() => {
    return attractions.filter((attraction) => {
      // Search filter
      if (
        searchTerm &&
        !attraction.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && attraction.type !== filterType) {
        return false;
      }

      // Thrill level filter
      if (
        filterThrillLevel !== 'all' &&
        attraction.thrill_level !== filterThrillLevel
      ) {
        return false;
      }

      // Kid friendly filter
      if (filterKidFriendly === 'kid-friendly' && !attraction.kid_friendly) {
        return false;
      } else if (
        filterKidFriendly === 'not-kid-friendly' &&
        attraction.kid_friendly
      ) {
        return false;
      }

      return true;
    });
  }, [
    attractions,
    searchTerm,
    filterType,
    filterThrillLevel,
    filterKidFriendly,
  ]);

  // Group attractions by park if multiple parks
  const attractionsByPark = useMemo(() => {
    const parks = new Map<
      number,
      { name: string; attractions: AttractionDetailResponseData[] }
    >();

    filteredAttractions.forEach((attraction) => {
      if (!parks.has(attraction.park_id)) {
        parks.set(attraction.park_id, {
          name: `Park ${attraction.park_id}`, // We'll need to get actual park names
          attractions: [],
        });
      }
      parks.get(attraction.park_id)!.attractions.push(attraction);
    });

    return parks;
  }, [filteredAttractions]);

  const handleAttractionToggle = (attractionId: string) => {
    const isSelected = selectedAttractions.includes(attractionId);

    if (isSelected) {
      // Remove from selection
      onSelectionChange(
        selectedAttractions.filter((id) => id !== attractionId)
      );
    } else {
      // Add to selection (if under limit)
      if (!maxSelections || selectedAttractions.length < maxSelections) {
        onSelectionChange([...selectedAttractions, attractionId]);
      }
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleSelectVisible = () => {
    const visibleIds = filteredAttractions
      .slice(
        0,
        maxSelections ? maxSelections - selectedAttractions.length : undefined
      )
      .map((a) => a.id.toString())
      .filter((id) => !selectedAttractions.includes(id));

    onSelectionChange([...selectedAttractions, ...visibleIds]);
  };

  const isAtLimitAndNotSelected = (attractionId: string) => {
    return (
      maxSelections &&
      selectedAttractions.length >= maxSelections &&
      !selectedAttractions.includes(attractionId)
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            {mode === 'must-do' ? 'Must-Do Attractions' : 'Attractions to Skip'}
          </h3>
          <p className="text-sm text-gray-600">
            {mode === 'must-do'
              ? 'Select attractions you definitely want to experience'
              : 'Select attractions you want to avoid'}
            {maxSelections &&
              ` (${selectedAttractions.length}/${maxSelections})`}
          </p>
        </div>

        <div className="flex space-x-2">
          {selectedAttractions.length > 0 && (
            <Button onClick={handleClearAll} variant="ghost" size="sm">
              Clear All
            </Button>
          )}
          {filteredAttractions.length > 0 &&
            (!maxSelections || selectedAttractions.length < maxSelections) && (
              <Button
                onClick={handleSelectVisible}
                variant="secondary"
                size="sm"
              >
                Select Visible
              </Button>
            )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Textbox
            id="attraction-search"
            label=""
            value={searchTerm}
            handleChange={(_, value) => setSearchTerm(value as string)}
            placeholder="Search attractions..."
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {attractionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={filterThrillLevel}
          onChange={(e) => setFilterThrillLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Thrill Levels</option>
          {thrillLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <select
          value={filterKidFriendly}
          onChange={(e) => setFilterKidFriendly(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Ages</option>
          <option value="kid-friendly">Kid-Friendly</option>
          <option value="not-kid-friendly">Adults Only</option>
        </select>
      </div>

      {/* Results Count */}
      {searchTerm ||
      filterType !== 'all' ||
      filterThrillLevel !== 'all' ||
      filterKidFriendly !== 'all' ? (
        <p className="text-sm text-gray-600">
          Showing {filteredAttractions.length} of {attractions.length}{' '}
          attractions
        </p>
      ) : null}

      {/* Attractions List */}
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {Array.from(attractionsByPark.entries()).map(([parkId, parkData]) => (
          <div key={parkId} className="space-y-3">
            <h4 className="font-medium text-gray-900 border-b pb-1">
              {parkData.name}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {parkData.attractions.map((attraction) => {
                const attractionId = attraction.id.toString();
                const isSelected = selectedAttractions.includes(attractionId);
                const isDisabled = isAtLimitAndNotSelected(attractionId);

                return (
                  <div
                    key={attraction.id}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all
                      ${
                        isSelected
                          ? mode === 'must-do'
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : isDisabled
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() =>
                      !isDisabled && handleAttractionToggle(attractionId)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">
                          {attraction.name}
                        </h5>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                          {attraction.type && <span>{attraction.type}</span>}
                          {attraction.thrill_level && (
                            <>
                              <span>•</span>
                              <span>{attraction.thrill_level}</span>
                            </>
                          )}
                          {attraction.avg_duration_min && (
                            <>
                              <span>•</span>
                              <span>{attraction.avg_duration_min}min</span>
                            </>
                          )}
                          {attraction.kid_friendly && (
                            <>
                              <span>•</span>
                              <span>Kid-friendly</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div
                        className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? mode === 'must-do'
                              ? 'border-green-500 bg-green-500'
                              : 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }
                      `}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredAttractions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No attractions found matching your criteria.</p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterThrillLevel('all');
              setFilterKidFriendly('all');
            }}
            variant="ghost"
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
