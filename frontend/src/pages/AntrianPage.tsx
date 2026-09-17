import { MainLayout } from '../components/layout/MainLayout';
import { AntrianList } from '../components/antrian/AntrianList';
import { useWebSocket } from '../hooks/useWebSocket';

export const AntrianPage = () => {
  useWebSocket();

  return (
    <MainLayout>
      <AntrianList />
    </MainLayout>
  );
};
