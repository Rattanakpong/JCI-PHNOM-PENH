export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section pt-16">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">{title}</h1>
        {children}
      </div>
      {description && <p className="mt-3 max-w-2xl text-brand-navy/70">{description}</p>}
    </div>
  );
}
