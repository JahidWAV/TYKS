import Navbar from '@/components/Navbar';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-onyx text-bone flex flex-col selection:bg-bone/20 selection:text-bone">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
