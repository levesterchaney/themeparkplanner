'use client';

interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function Card({ title, description, children }: CardProps) {
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border">
      {/* Card Header */}
      <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
        <div className="flex items-center gap-2">
          <h4 className="leading-none">{title}</h4>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Card Content */}
      <div className={'px-6 [&:last-child]:pb-6'}>{children}</div>
    </div>
  );
}
