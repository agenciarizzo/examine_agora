import type { CSSProperties, ReactNode } from 'react';
import { BotaoCeu } from '@/components/Bits';
import { clinica, telHref } from '@/lib/content';
import { cor } from '@/lib/theme';

/**
 * O par de conversão: WhatsApp sólido + "Ligar" vazado, lado a lado — extraído
 * de `app/agende-seu-exame/page.tsx` (o único lugar onde já existia) pra
 * reusar nos pontos de maior alcance. O telefone deixa de ser cidadão de
 * segunda classe sem tirar o WhatsApp de lugar nenhum.
 */
export function ParCta({
  waHref,
  children,
  fontSize = 18,
  padding = '18px 36px',
}: {
  waHref: string;
  children: ReactNode;
  fontSize?: number;
  padding?: string;
}) {
  return (
    <>
      <BotaoCeu href={waHref} fontSize={fontSize} padding={padding}>
        {children}
      </BotaoCeu>
      <BotaoLigar fontSize={fontSize} padding={padding} />
    </>
  );
}

/** Só o vazado — para os casos em que o WhatsApp já está resolvido por fora. */
export function BotaoLigar({
  fontSize = 18,
  padding = '18px 36px',
}: {
  fontSize?: number;
  padding?: string;
}) {
  return (
    <a href={telHref} style={{ ...vazado, fontSize, padding }}>
      Ligar {clinica.phone}
    </a>
  );
}

const vazado: CSSProperties = {
  display: 'inline-block',
  border: '1px solid rgba(169,214,245,.5)',
  color: cor.ceu,
  textDecoration: 'none',
  fontWeight: 500,
  borderRadius: 999,
};
