import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen flex-col bg-[#f6f8fb]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="mobile-main flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
