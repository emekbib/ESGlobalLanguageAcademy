export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <span className="text-lg font-semibold">Teacher Portal</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
