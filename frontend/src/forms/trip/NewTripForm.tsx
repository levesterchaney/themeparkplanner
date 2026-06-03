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
  const [tripData, setTripData] = useState({
    title: '',
    destination: '',
    start_date: new Date(),
    end_date: new Date(),
    party_size: 2,
    has_kids: false,
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
    if (tripData.end_date < tripData.start_date) {
      setError('Invalid date range provided.');
      setLoading(false);
      return;
    }

    try {
      // Format dates as YYYY-MM-DD strings for API
      const apiData: NewTripRequestData = {
        title: tripData.title,
        destination: tripData.destination,
        start_date: tripData.start_date.toISOString().split('T')[0],
        end_date: tripData.end_date.toISOString().split('T')[0],
        party_size: tripData.party_size,
        has_kids: tripData.has_kids,
      };

      await tripService.createTrip(apiData);
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
          has_kids: user.preferences?.has_kids || false,
          party_size: user.preferences?.default_party_size || 2,
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
            id="start_date"
            label="Trip Start Date:"
            value={tripData.start_date}
            handleChange={updateTripData}
          />
          <DatePicker
            id="end_date"
            label="Trip End Date:"
            value={tripData.end_date}
            handleChange={updateTripData}
          />
          <Numberbox
            id="party_size"
            label="Party Size"
            value={tripData.party_size}
            handleChange={updateTripData}
          />
          <Checkbox
            id="has_kids"
            label="Travelling with Kids?"
            value={tripData.has_kids}
            isChecked={tripData.has_kids}
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
