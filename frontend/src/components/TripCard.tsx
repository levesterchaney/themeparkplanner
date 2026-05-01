'use client';

interface TripCaardProps {
  title: string;
  destination: string;
  dateRange: string;
}

export default function TripCard({
  title,
  destination,
  dateRange,
}: TripCaardProps) {
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border max-w-md">
      {/* Card Image */}
      <div className="h-48 bg-gray-200 rounded-tl-xl rounded-tr-xl" />

      {/* Card Body */}
      <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
        <div className="flex items-center gap-2">
          <h4 className="leading-none">{title}</h4>
        </div>
        <p className="text-muted-foreground">{destination}</p>
        <p className="text-muted-foreground">{dateRange}</p>
      </div>
      <a className={'px-6 py-3'}>View More</a>
    </div>
  );
}
