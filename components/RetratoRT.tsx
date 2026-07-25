import Image from 'next/image';
import { clinica } from '@/lib/content';

/**
 * Retrato do responsável técnico, no lugar das molduras "· pendente ·" dos
 * HTML de referência. Mantém a caixa e o raio do design; a foto entra em
 * `cover` para não distorcer.
 */
export function RetratoRT({
  width,
  height,
  priority = false,
}: {
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <div
      style={{
        width,
        height,
        flex: '0 0 auto',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#EEF6FC',
      }}
    >
      <Image
        src="/dr-flavio.webp"
        alt={`${clinica.rt.name} — ${clinica.rt.specialty}`}
        width={900}
        height={978}
        priority={priority}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
      />
    </div>
  );
}
