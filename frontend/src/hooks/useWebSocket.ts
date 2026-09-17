import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket, onAntrianUpdate, offAntrianUpdate } from '../services/websocket';
import { useAntrianStore } from '../store/antrianStore';

export const useWebSocket = () => {
  const { updateAntrianItem, addAntrian } = useAntrianStore();

  useEffect(() => {
    connectWebSocket();

    const handleUpdate = (data: any) => {
      console.log('Antrian update:', data);
      updateAntrianItem(data.kunjungan_id, {
        status_antrian: data.status,
        prioritas: data.prioritas,
      });
    };

    onAntrianUpdate(handleUpdate);

    return () => {
      offAntrianUpdate();
      disconnectWebSocket();
    };
  }, [updateAntrianItem, addAntrian]);
};
