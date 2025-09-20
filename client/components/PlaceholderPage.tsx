export default function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{description || "This page is coming soon. Ask to fill it in next."}</p>
    </div>
  );
}
