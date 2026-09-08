export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-onyx text-bone flex flex-col selection:bg-cobalt selection:text-bone">
      <main className="flex-1">{children}</main>
    </div>
  );
}
