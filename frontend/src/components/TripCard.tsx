'use client';

import Link from 'next/link';

interface TripCardProps {
  id: number;
  title: string;
  destination: string;
  dateRange: string;
  status?: string;
  partySize?: number;
  hasKids?: boolean;
}

export default function TripCard({
  id,
  title,
  destination,
  dateRange,
  status,
  partySize,
  hasKids,
}: TripCardProps) {
  return (
    <Link
      href={`/trips/${id}`}
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border max-w-md hover:shadow-lg transition-shadow cursor-pointer no-underline"
    >
      {/* Card Image */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-tl-xl rounded-tr-xl relative">
        <div className="absolute inset-0 bg-black/20 rounded-tl-xl rounded-tr-xl" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 pb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">{destination}</p>
            {status && (
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                  status === 'planned'
                    ? 'bg-green-100 text-green-800'
                    : status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
          {(partySize || hasKids !== undefined) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {partySize && <span>{partySize} people</span>}
              {hasKids !== undefined && (
                <span>{hasKids ? 'With kids' : 'Adults only'}</span>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <button className="text-primary hover:text-primary/80 font-medium text-sm">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}
