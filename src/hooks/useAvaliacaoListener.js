import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function useAvaliacaoListener(onNewAvaliacao, onMetaReached, metaRespostas = 10) {
  const unsubscribeRef = useRef(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    const setupListener = async () => {
      try {
        // Get initial count
        const avaliacoes = await base44.entities.avaliacoes.list('created_date', 1);
        if (avaliacoes.length > 0) {
          lastCountRef.current = avaliacoes.length;
        }

        // Subscribe to new avaliacoes
        unsubscribeRef.current = base44.entities.avaliacoes.subscribe((event) => {
          if (event.type === 'create') {
            onNewAvaliacao?.({
              id: event.id,
              nome: event.data?.nome || 'Nova avaliação',
              nps: event.data?.nps_geral,
              tema: event.data?.tema
            });

            // Check if meta was reached
            const newCount = lastCountRef.current + 1;
            lastCountRef.current = newCount;
            
            if (newCount % metaRespostas === 0) {
              onMetaReached?.({
                count: newCount,
                meta: metaRespostas
              });
            }
          }
        });
      } catch (error) {
        console.error('Error setting up avaliacao listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [onNewAvaliacao, onMetaReached, metaRespostas]);
}