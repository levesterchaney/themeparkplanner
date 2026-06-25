'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wizard,
  WizardStep,
  Card,
  Dropdown,
  Checkbox,
  AttractionSelector,
} from '@/components';
import { ItineraryPreferencesData } from '@/types/api';
import { parkService, TripDetailResponseData } from '@/services';
import {
  AttractionDetailResponseData,
  ParkDetailResponseData,
} from '@/services/park';

interface ItineraryPreferencesWizardProps {
  trip: TripDetailResponseData;
  onComplete: (preferences: ItineraryPreferencesData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ItineraryPreferencesWizard({
  trip,
  onComplete,
  onCancel,
  isLoading = false,
}: ItineraryPreferencesWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [attractions, setAttractions] = useState<
    AttractionDetailResponseData[]
  >([]);
  const [parks, setParks] = useState<ParkDetailResponseData[]>([]);
  const [loadingAttractions, setLoadingAttractions] = useState(false);

  // Form state
  const [preferences, setPreferences] = useState<ItineraryPreferencesData>({
    thrill_level: 'moderate',
    visit_style: 'moderate',
    start_time: '09:00',
    end_time: '21:00',
    break_preferences: {
      lunch_break: true,
      afternoon_rest: false,
      preferred_meal_times: ['12:00', '18:00'],
    },
    priority_factors: {
      minimize_walking: false,
      avoid_crowds: true,
      maximize_attractions: false,
      include_character_meets: false,
      prioritize_new_attractions: false,
    },
    must_do_attractions: [],
    skip_attractions: [],
    preferred_attraction_types: [],
    accessibility_needs: [],
    dietary_restrictions: [],
    budget_tier: 'moderate',
  });

  // Load attractions data
  useEffect(() => {
    const loadAttractions = async () => {
      try {
        setLoadingAttractions(true);

        // Get parks for this destination
        const parkList = await parkService.getParkList();
        const destinationParks = parkList.filter(
          (park) => park.resort_name === trip.destination
        );

        // Set parks state
        setParks(destinationParks);

        // Load attractions for each park
        const allAttractions: AttractionDetailResponseData[] = [];
        for (const park of destinationParks) {
          try {
            const parkAttractions = await parkService.getParkAttractions(
              park.id
            );
            allAttractions.push(...parkAttractions);
          } catch (error) {
            console.error(
              `Failed to load attractions for park ${park.id}:`,
              error
            );
          }
        }

        setAttractions(allAttractions);
      } catch (error) {
        console.error('Failed to load attractions:', error);
      } finally {
        setLoadingAttractions(false);
      }
    };

    loadAttractions();
  }, [trip.destination]);

  const updatePreferences = (updates: Partial<ItineraryPreferencesData>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateNestedPreferences = <K extends keyof ItineraryPreferencesData>(
    key: K,
    updates: Partial<NonNullable<ItineraryPreferencesData[K]>>
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: {
        ...((prev[key] as Record<string, unknown>) || {}),
        ...updates,
      },
    }));
  };

  // Validation for each step
  const stepValidations = useMemo(
    () => ({
      0: true, // Experience style - always valid
      1: true, // Attraction preferences - always valid
      2: true, // Must-do & Skip - always valid (optional)
      3: true, // Advanced options - always valid
      4: true, // Review - always valid
    }),
    []
  );

  const steps: WizardStep[] = [
    {
      id: 'experience-style',
      title: 'Experience Style',
      description: 'How would you like to experience the park?',
      isValid: stepValidations[0],
      content: (
        <div className="space-y-6">
          <Card
            title="Visit Pace"
            description="Choose your preferred touring pace"
          >
            <div className="space-y-4">
              <Dropdown
                id="visit_style"
                label="Visit Style"
                current={preferences.visit_style || 'moderate'}
                options={[
                  {
                    label: 'Relaxed - Plenty of breaks and leisurely touring',
                    value: 'relaxed',
                  },
                  {
                    label: 'Moderate - Balanced pace with reasonable breaks',
                    value: 'moderate',
                  },
                  {
                    label: 'Aggressive - Fast-paced with minimal breaks',
                    value: 'aggressive',
                  },
                  {
                    label: 'Commando - Maximum attractions, minimal downtime',
                    value: 'commando',
                  },
                ]}
                handleChange={(field, value) =>
                  updatePreferences({ [field]: value })
                }
              />
            </div>
          </Card>

          <Card
            title="Park Hours"
            description="When do you want to start and end your day?"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <select
                  value={preferences.start_time}
                  onChange={(e) =>
                    updatePreferences({ start_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="07:00">7:00 AM (Early Entry)</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM (Official Open)</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Time
                </label>
                <select
                  value={preferences.end_time}
                  onChange={(e) =>
                    updatePreferences({ end_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                  <option value="22:00">10:00 PM (Late)</option>
                  <option value="23:00">11:00 PM (Extended Hours)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card
            title="Break Preferences"
            description="How do you want to handle breaks and meals?"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Checkbox
                  id="lunch_break"
                  label="Schedule dedicated lunch break"
                  value={preferences.break_preferences?.lunch_break || false}
                  isChecked={
                    preferences.break_preferences?.lunch_break || false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('break_preferences', {
                      lunch_break: isChecked,
                    })
                  }
                />
                <Checkbox
                  id="afternoon_rest"
                  label="Include afternoon rest period"
                  value={preferences.break_preferences?.afternoon_rest || false}
                  isChecked={
                    preferences.break_preferences?.afternoon_rest || false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('break_preferences', {
                      afternoon_rest: isChecked,
                    })
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'attraction-preferences',
      title: 'Attraction Preferences',
      description: 'What types of experiences are you interested in?',
      isValid: stepValidations[1],
      content: (
        <div className="space-y-6">
          <Card
            title="Thrill Level"
            description="Override your profile thrill preference for this trip"
          >
            <Dropdown
              id="thrill_level"
              label="Preferred Thrill Level"
              current={preferences.thrill_level || 'moderate'}
              options={[
                { label: 'Low - Gentle rides and shows', value: 'low' },
                { label: 'Moderate - Mix of everything', value: 'moderate' },
                { label: 'High - Thrill rides and coasters', value: 'high' },
                {
                  label: 'Extreme - Only the most intense rides',
                  value: 'extreme',
                },
              ]}
              handleChange={(field, value) =>
                updatePreferences({ [field]: value })
              }
            />
          </Card>

          <Card
            title="Experience Priorities"
            description="What aspects of your visit are most important?"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Checkbox
                  id="maximize_attractions"
                  label="Maximize number of attractions"
                  value={
                    preferences.priority_factors?.maximize_attractions || false
                  }
                  isChecked={
                    preferences.priority_factors?.maximize_attractions || false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('priority_factors', {
                      maximize_attractions: isChecked,
                    })
                  }
                />
                <Checkbox
                  id="avoid_crowds"
                  label="Avoid crowded times/areas"
                  value={preferences.priority_factors?.avoid_crowds || false}
                  isChecked={
                    preferences.priority_factors?.avoid_crowds || false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('priority_factors', {
                      avoid_crowds: isChecked,
                    })
                  }
                />
                <Checkbox
                  id="minimize_walking"
                  label="Minimize walking distance"
                  value={
                    preferences.priority_factors?.minimize_walking || false
                  }
                  isChecked={
                    preferences.priority_factors?.minimize_walking || false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('priority_factors', {
                      minimize_walking: isChecked,
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                <Checkbox
                  id="include_character_meets"
                  label="Include character meet & greets"
                  value={
                    preferences.priority_factors?.include_character_meets ||
                    false
                  }
                  isChecked={
                    preferences.priority_factors?.include_character_meets ||
                    false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('priority_factors', {
                      include_character_meets: isChecked,
                    })
                  }
                />
                <Checkbox
                  id="prioritize_new_attractions"
                  label="Prioritize newest attractions"
                  value={
                    preferences.priority_factors?.prioritize_new_attractions ||
                    false
                  }
                  isChecked={
                    preferences.priority_factors?.prioritize_new_attractions ||
                    false
                  }
                  handleChange={(field, value, isChecked) =>
                    updateNestedPreferences('priority_factors', {
                      prioritize_new_attractions: isChecked,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          <Card
            title="Budget Tier"
            description="This affects dining and experience recommendations"
          >
            <Dropdown
              id="budget_tier"
              label="Budget Level"
              current={preferences.budget_tier || 'moderate'}
              options={[
                {
                  label: 'Budget - Counter service and value options',
                  value: 'budget',
                },
                {
                  label: 'Moderate - Mix of dining options',
                  value: 'moderate',
                },
                {
                  label: 'Premium - Table service and signature experiences',
                  value: 'premium',
                },
              ]}
              handleChange={(field, value) =>
                updatePreferences({ [field]: value })
              }
            />
          </Card>
        </div>
      ),
    },
    {
      id: 'must-do-skip',
      title: 'Must-Do & Skip Lists',
      description: 'Customize your attraction priorities',
      isValid: stepValidations[2],
      content: (
        <div className="space-y-6">
          {loadingAttractions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading attractions...</p>
            </div>
          ) : attractions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No attractions found for {trip.destination}.</p>
              <p className="text-sm mt-1">
                You can still continue to generate your itinerary.
              </p>
            </div>
          ) : (
            <>
              <AttractionSelector
                attractions={attractions}
                selectedAttractions={preferences.must_do_attractions || []}
                onSelectionChange={(ids) =>
                  updatePreferences({ must_do_attractions: ids })
                }
                mode="must-do"
                maxSelections={10}
                parks={parks}
              />

              <AttractionSelector
                attractions={attractions}
                selectedAttractions={preferences.skip_attractions || []}
                onSelectionChange={(ids) =>
                  updatePreferences({ skip_attractions: ids })
                }
                mode="skip"
                parks={parks}
              />
            </>
          )}
        </div>
      ),
    },
    {
      id: 'advanced-options',
      title: 'Advanced Options',
      description: 'Additional preferences for your group',
      isValid: stepValidations[3],
      content: (
        <div className="space-y-6">
          <Card
            title="Accessibility & Dietary"
            description="Special considerations for your group"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Accessibility Needs
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { label: 'Wheelchair Access', value: 'wheelchair' },
                    {
                      label: 'Hearing Impairment',
                      value: 'hearing_impairment',
                    },
                    { label: 'Visual Impairment', value: 'visual_impairment' },
                    { label: 'Service Animal', value: 'service_animal' },
                    {
                      label: 'Cognitive Disability',
                      value: 'cognitive_disability',
                    },
                    { label: 'Mobility Aid', value: 'mobility_aid' },
                  ].map((option) => (
                    <Checkbox
                      key={option.value}
                      id={`access_${option.value}`}
                      label={option.label}
                      value={
                        preferences.accessibility_needs?.includes(
                          option.value
                        ) || false
                      }
                      isChecked={
                        preferences.accessibility_needs?.includes(
                          option.value
                        ) || false
                      }
                      handleChange={(field, value, isChecked) => {
                        const current = preferences.accessibility_needs || [];
                        const updated = isChecked
                          ? [...current, option.value]
                          : current.filter((item) => item !== option.value);
                        updatePreferences({ accessibility_needs: updated });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: 'Vegetarian', value: 'vegetarian' },
                    { label: 'Vegan', value: 'vegan' },
                    { label: 'Gluten-Free', value: 'gluten_free' },
                    { label: 'Dairy-Free', value: 'dairy_free' },
                    { label: 'Nut Allergy', value: 'nut_allergy' },
                    { label: 'Shellfish Allergy', value: 'shellfish_allergy' },
                    { label: 'Halal', value: 'halal' },
                    { label: 'Kosher', value: 'kosher' },
                  ].map((option) => (
                    <Checkbox
                      key={option.value}
                      id={`diet_${option.value}`}
                      label={option.label}
                      value={
                        preferences.dietary_restrictions?.includes(
                          option.value
                        ) || false
                      }
                      isChecked={
                        preferences.dietary_restrictions?.includes(
                          option.value
                        ) || false
                      }
                      handleChange={(field, value, isChecked) => {
                        const current = preferences.dietary_restrictions || [];
                        const updated = isChecked
                          ? [...current, option.value]
                          : current.filter((item) => item !== option.value);
                        updatePreferences({ dietary_restrictions: updated });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Review your preferences and generate your itinerary',
      isValid: stepValidations[4],
      content: (
        <div className="space-y-6">
          <Card
            title="Itinerary Summary"
            description="Your customized preferences"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Experience Style</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>
                    Visit Style:{' '}
                    <span className="font-medium capitalize">
                      {preferences.visit_style}
                    </span>
                  </li>
                  <li>
                    Park Hours: {preferences.start_time} -{' '}
                    {preferences.end_time}
                  </li>
                  <li>
                    Thrill Level:{' '}
                    <span className="font-medium capitalize">
                      {preferences.thrill_level}
                    </span>
                  </li>
                  <li>
                    Budget:{' '}
                    <span className="font-medium capitalize">
                      {preferences.budget_tier}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Priorities</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {preferences.priority_factors?.maximize_attractions && (
                    <li>• Maximize attractions</li>
                  )}
                  {preferences.priority_factors?.avoid_crowds && (
                    <li>• Avoid crowds</li>
                  )}
                  {preferences.priority_factors?.minimize_walking && (
                    <li>• Minimize walking</li>
                  )}
                  {preferences.priority_factors?.include_character_meets && (
                    <li>• Character meet & greets</li>
                  )}
                  {preferences.priority_factors?.prioritize_new_attractions && (
                    <li>• Newest attractions</li>
                  )}
                  {preferences.break_preferences?.lunch_break && (
                    <li>• Lunch break</li>
                  )}
                  {preferences.break_preferences?.afternoon_rest && (
                    <li>• Afternoon rest</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium mb-2">
                  Must-Do Attractions (
                  {preferences.must_do_attractions?.length || 0})
                </h4>
                {preferences.must_do_attractions?.length ? (
                  <div className="text-sm text-gray-600">
                    {preferences.must_do_attractions.length} attraction(s)
                    selected
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">None selected</div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Skip List ({preferences.skip_attractions?.length || 0})
                </h4>
                {preferences.skip_attractions?.length ? (
                  <div className="text-sm text-gray-600">
                    {preferences.skip_attractions.length} attraction(s) to avoid
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">None selected</div>
                )}
              </div>
            </div>

            {(preferences.accessibility_needs?.length ||
              preferences.dietary_restrictions?.length) && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Special Considerations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {preferences.accessibility_needs?.length ? (
                    <div>
                      <span className="text-sm font-medium">
                        Accessibility:
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        {preferences.accessibility_needs.length} need(s)
                      </span>
                    </div>
                  ) : null}
                  {preferences.dietary_restrictions?.length ? (
                    <div>
                      <span className="text-sm font-medium">Dietary:</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {preferences.dietary_restrictions.length} restriction(s)
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Ready to Generate
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  Your personalized itinerary will be generated based on these
                  preferences. You can always regenerate with different settings
                  later.
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
        <Wizard
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={() => onComplete(preferences)}
          onCancel={onCancel}
          completionData={preferences}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
