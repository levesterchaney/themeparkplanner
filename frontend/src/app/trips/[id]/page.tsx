'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  tripService,
  TripDetailResponseData,
  parkService,
  itineraryService,
} from '@/services';
import {
  Button,
  Card,
  Textbox,
  Numberbox,
  Checkbox,
  DatePicker,
  Dropdown,
  ItineraryPreferencesWizard,
} from '@/components';
import { UpdateTripRequestData, ItineraryPreferencesData } from '@/types/api';

interface DestinationOption {
  label: string;
  value: string;
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetailResponseData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);

  // Form data for editing
  const [editData, setEditData] = useState<UpdateTripRequestData>({});

  // Itinerary wizard state
  const [showItineraryWizard, setShowItineraryWizard] = useState(false);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const tripData = await tripService.getSpecificTrip(tripId);
        setTrip(tripData);

        // Initialize edit data with current trip data
        setEditData({
          title: tripData.title,
          destination: tripData.destination,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          party_size: tripData.party_size,
          has_kids: tripData.has_kids,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load trip details'
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchDestinations = async () => {
      try {
        const parkList = await parkService.getParkList();
        const seen: string[] = [];
        let destinationList: DestinationOption[] = [];

        parkList.forEach((park) => {
          if (!seen.includes(park.resort_name)) {
            seen.push(park.resort_name);
            destinationList.push({
              label: park.resort_name,
              value: park.resort_name,
            });
          }
        });
        destinationList = destinationList.sort((a, b) =>
          a.label.localeCompare(b.label)
        );
        setDestinationOptions(destinationList);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
        setDestinationOptions([]);
      }
    };

    if (tripId) {
      fetchTrip();
      fetchDestinations();
    }
  }, [tripId]);

  const handleEditChange = (
    field: string,
    value: string | number | boolean | Date | undefined
  ) => {
    setEditData((prev) => ({
      ...prev,
      [field]:
        field.includes('date') && value instanceof Date
          ? value.toISOString().split('T')[0]
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await tripService.updateTrip(tripId, editData);

      // Refresh trip data
      const updatedTrip = await tripService.getSpecificTrip(tripId);
      setTrip(updatedTrip);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trip');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this trip? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await tripService.deleteTrip(tripId);
      router.push('/trips');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!trip) return;

    // Reset edit data to original trip data
    setEditData({
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      party_size: trip.party_size,
      has_kids: trip.has_kids,
    });
    setEditMode(false);
  };

  const handleItineraryGeneration = async (
    preferences: ItineraryPreferencesData
  ) => {
    try {
      setGeneratingItinerary(true);

      // Call itinerary service to generate itinerary
      const response = await itineraryService.generateItinerary(
        tripId,
        preferences
      );

      // Close wizard and show success
      setShowItineraryWizard(false);
      alert(`Itinerary generated successfully! ${response.message}`);

      // TODO: Refresh trip data to show itinerary or redirect to itinerary view
    } catch (err) {
      // Keep wizard open on error
      setError(
        err instanceof Error ? err.message : 'Failed to generate itinerary'
      );
    } finally {
      setGeneratingItinerary(false);
    }
  };

  const handleOpenItineraryWizard = () => {
    setShowItineraryWizard(true);
  };

  const handleCloseItineraryWizard = () => {
    setShowItineraryWizard(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <Button
            onClick={() => router.push('/trips')}
            variant="secondary"
            className="mt-4"
          >
            Back to Trips
          </Button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Trip not found</p>
          <Button
            onClick={() => router.push('/trips')}
            variant="secondary"
            className="mt-4"
          >
            Back to Trips
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              onClick={() => router.push('/trips')}
              variant="secondary"
              className="mb-4"
            >
              ← Back to Trips
            </Button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {trip.title}
                </h1>
                <p className="text-gray-600 mt-1">Trip Details and Itinerary</p>
              </div>
              <div className="flex space-x-2">
                {!editMode ? (
                  <>
                    <Button onClick={() => setEditMode(true)} variant="primary">
                      Edit Trip
                    </Button>
                    <Button onClick={handleDelete} variant="destructive">
                      Delete Trip
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleCancel} variant="secondary">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} variant="primary">
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card
              title="Trip Information"
              description="Basic details about your trip"
            >
              {editMode ? (
                <div className="space-y-4">
                  <Textbox
                    id="title"
                    label="Trip Title"
                    value={editData.title || ''}
                    handleChange={handleEditChange}
                  />
                  <Dropdown
                    id="destination"
                    label="Destination"
                    options={destinationOptions}
                    current={editData.destination || ''}
                    handleChange={handleEditChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DatePicker
                      id="start_date"
                      label="Start Date"
                      value={new Date(editData.start_date || trip.start_date)}
                      handleChange={handleEditChange}
                    />
                    <DatePicker
                      id="end_date"
                      label="End Date"
                      value={new Date(editData.end_date || trip.end_date)}
                      handleChange={handleEditChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Numberbox
                      id="party_size"
                      label="Party Size"
                      value={editData.party_size || trip.party_size}
                      handleChange={handleEditChange}
                    />
                    <div className="flex items-center mt-6">
                      <Checkbox
                        id="has_kids"
                        label="Travelling with Kids?"
                        value={editData.has_kids ?? trip.has_kids}
                        isChecked={editData.has_kids ?? trip.has_kids}
                        handleChange={handleEditChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Destination
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {trip.destination}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {trip.status}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(trip.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Party Size
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {trip.party_size} people
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Travelling with Kids
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {trip.has_kids ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card
              title="Itinerary"
              description="Your planned activities and schedule"
            >
              <div className="text-center py-8">
                <div className="space-y-4">
                  <div className="text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      No Itinerary Yet
                    </p>
                    <p className="text-sm">
                      Create a personalized day-by-day plan for your trip with
                      AI-powered recommendations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleOpenItineraryWizard}
                      variant="primary"
                      className="mx-auto"
                    >
                      Generate Itinerary
                    </Button>
                    <p className="text-xs text-gray-500">
                      We&apos;ll ask a few questions to customize your perfect
                      itinerary
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Itinerary Preferences Wizard */}
      {showItineraryWizard && trip && (
        <ItineraryPreferencesWizard
          trip={trip}
          onComplete={handleItineraryGeneration}
          onCancel={handleCloseItineraryWizard}
          isLoading={generatingItinerary}
        />
      )}
    </>
  );
}
