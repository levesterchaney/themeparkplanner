'use client';

import {
  Button,
  Checkbox,
  DatePicker,
  Dropdown,
  Numberbox,
  Textbox,
} from '@/components';
import { useEffect, useState } from 'react';
import { parkService, tripService, userService } from '@/services';
import { NewTripRequestData } from '@/types/api';
import { useRouter } from 'next/navigation';

interface DestinationOption {
  label: string;
  value: string;
}

export default function NewTripForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [destinationOptions, setDestinationOptions] = useState<
    DestinationOption[]
  >([]);
  const [tripData, setTripData] = useState<NewTripRequestData>({
    title: '',
    destination: '',
    startDate: new Date(),
    endDate: new Date(),
    partySize: 2,
    hasKids: false,
  });

  console.log(loading); //TODO remove

  const updateTripData = (
    field: string,
    value: string | number | boolean | Date | undefined
  ) => {
    setTripData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitTripData = async () => {
    setLoading(true);
    if (tripData.endDate < tripData.startDate) {
      setError('Invalid date range provided.');
    }
    try {
      await tripService.createTrip(tripData);
      router.push('/trips');
    } catch (error: unknown) {
      const errorMessage =
        (error as { details?: { error?: string }; message?: string })?.details
          ?.error ||
        (error as { message?: string })?.message ||
        'Something went wrong.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const user = await userService.getProfile();
        setTripData((prev) => ({
          ...prev,
          hasKids: user.preferences?.hasKids || false,
          partySize: user.preferences?.defaultPartySize || 2,
        }));
      } catch (error) {
        console.error('Failed to fetch user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, []);

  useEffect(() => {
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

    fetchDestinations();
  }, []);

  //TODO enable UI to create trip
  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
        <div>
          <Textbox
            id="title"
            label="Title"
            value={tripData.title}
            handleChange={updateTripData}
          />
          <Dropdown
            id="destination"
            label="Destination"
            options={destinationOptions}
            current={tripData.destination}
            handleChange={updateTripData}
          />
          <DatePicker
            id="startDate"
            label="Trip Start Date:"
            value={tripData.startDate}
            handleChange={updateTripData}
          />
          <DatePicker
            id="endDate"
            label="Trip End Date:"
            value={tripData.endDate}
            handleChange={updateTripData}
          />
          <Numberbox
            id="partySize"
            label="Party Size"
            value={tripData.partySize}
            handleChange={updateTripData}
          />
          <Checkbox
            id="hasKids"
            label="Travelling with Kids?"
            value={tripData.hasKids}
            isChecked={tripData.hasKids}
            handleChange={updateTripData}
          />
          <div className="space-y-4 flex justify-end">
            <Button type="submit" onClick={() => submitTripData()}>
              Create Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
