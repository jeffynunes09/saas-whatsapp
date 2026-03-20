import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col pb-16 md:pb-0 max-w-2xl mx-auto w-full md:max-w-none">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
