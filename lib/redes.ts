import { clinica } from './content';

/**
 * Fonte única das redes sociais do site: alimenta o topo, o rodapé e o
 * `sameAs` do JSON-LD. Só entra perfil que é do cliente e tem procedência;
 * Facebook e LinkedIn não entram (decisão da agência).
 */
export type Rede = { rede: 'instagram'; url: string; label: string };

export const REDES: Rede[] = [
  { rede: 'instagram', url: clinica.instagram, label: 'Instagram da Examine Agora' },
];

/** Caminho SVG (viewBox 24) do ícone de cada rede. */
export const ICONES: Record<Rede['rede'], string> = {
  instagram:
    'M12 2c-2.7 0-3.1 0-4.1.1-1.1.1-1.8.2-2.5.5-.7.3-1.3.6-1.9 1.2C2.9 4.4 2.6 5 2.3 5.7c-.3.7-.4 1.4-.5 2.5C1.7 9.2 1.7 9.6 1.7 12.3s0 3.1.1 4.1c.1 1.1.2 1.8.5 2.5.3.7.6 1.3 1.2 1.9.6.6 1.2.9 1.9 1.2.7.3 1.4.4 2.5.5 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c1.1-.1 1.8-.2 2.5-.5.7-.3 1.3-.6 1.9-1.2.6-.6.9-1.2 1.2-1.9.3-.7.4-1.4.5-2.5.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-1.1-.2-1.8-.5-2.5-.3-.7-.6-1.3-1.2-1.9-.6-.6-1.2-.9-1.9-1.2-.7-.3-1.4-.4-2.5-.5C15.1 2 14.7 2 12 2zm0 1.8c2.6 0 3 0 4 .1 1 .1 1.5.2 1.9.4.5.2.8.4 1.1.7.3.3.5.6.7 1.1.2.4.3.9.4 1.9.1 1 .1 1.4.1 4s0 3-.1 4c-.1 1-.2 1.5-.4 1.9-.2.5-.4.8-.7 1.1-.3.3-.6.5-1.1.7-.4.2-.9.3-1.9.4-1 .1-1.4.1-4 .1s-3 0-4-.1c-1-.1-1.5-.2-1.9-.4-.5-.2-.8-.4-1.1-.7-.3-.3-.5-.6-.7-1.1-.2-.4-.3-.9-.4-1.9-.1-1-.1-1.4-.1-4s0-3 .1-4c.1-1 .2-1.5.4-1.9.2-.5.4-.8.7-1.1.3-.3.6-.5 1.1-.7.4-.2.9-.3 1.9-.4 1-.1 1.4-.1 4-.1zm0 3a5.2 5.2 0 1 0 0 10.4A5.2 5.2 0 0 0 12 6.8zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8zm5.4-8.8a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z',
};
