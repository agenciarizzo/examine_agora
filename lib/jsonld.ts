/**
 * JSON-LD por página: MedicalProcedure/MedicalTest + FAQPage + MedicalClinic
 * (spec do `nota` do ea-landings.json).
 */
import { absolute, clinica, href, page, type Page, SITE_URL } from './content';
import { type Post, postPath } from './posts';

type Json = Record<string, unknown>;

/** Seg a sex 8h–18h · Sáb 8h–12h — horário confirmado pelo cliente em 2026-07-25. */
const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '18:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday'],
    opens: '08:00',
    closes: '12:00',
  },
];

export const CLINIC_ID = `${SITE_URL}/#clinica`;

export function medicalClinic(): Json {
  return {
    '@type': 'MedicalClinic',
    '@id': CLINIC_ID,
    name: clinica.nome,
    url: SITE_URL,
    telephone: clinica.phone,
    medicalSpecialty: 'Radiography',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Recanto das Emas, Q102 L03 Loja 06',
      addressLocality: 'Recanto das Emas',
      addressRegion: 'DF',
      addressCountry: 'BR',
    },
    areaServed: [
      { '@type': 'Place', name: 'Recanto das Emas · Brasília-DF' },
      { '@type': 'Place', name: 'Riacho Fundo II · Brasília-DF' },
    ],
    openingHoursSpecification: OPENING_HOURS,
    paymentAccepted: clinica.pagamento,
    hasMap: 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('Examine Agora, ' + clinica.address.replace(/ · /g, ', ')),
    employee: {
      '@type': 'Physician',
      name: clinica.rt.name,
      medicalSpecialty: 'Radiography',
      identifier: `${clinica.rt.crm} · ${clinica.rt.rqe}`,
    },
  };
}

/**
 * Procedimentos guiados (`grupo: proc`) viram MedicalProcedure; exames de
 * ultrassom e laboratório viram MedicalTest.
 */
function procedureOrTest(p: Page): Json {
  const isProc = p.grupo === 'proc';
  const node: Json = {
    '@type': isProc ? 'MedicalProcedure' : 'MedicalTest',
    '@id': `${absolute(p.path)}#procedimento`,
    name: p.nome,
    url: absolute(p.path),
    description: p.hero?.sub ?? p.seo.description,
    ...(isProc
      ? { procedureType: 'https://schema.org/PercutaneousProcedure', bodyLocation: p.nome }
      : { usedToDiagnose: p.seo.kw }),
    availableService: { '@id': CLINIC_ID },
    provider: { '@id': CLINIC_ID },
  };
  if (p.indicada?.itens.length) node.indication = p.indicada.itens.map((i) => ({
    '@type': 'MedicalIndication',
    description: i,
  }));
  if (p.preparo?.itens.length) node.preparation = p.preparo.itens.join(' ');
  if (p.depois?.itens.length) node.followup = p.depois.itens.join(' ');
  if (p.como?.passos.length) {
    node.howPerformed = p.como.passos.map((s) => `${s.t}: ${s.d}`).join(' ');
  }
  return node;
}

function faqPage(p: Page): Json | null {
  if (!p.faq?.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${absolute(p.path)}#faq`,
    mainEntity: p.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function webPage(p: Page): Json {
  return {
    '@type': 'WebPage',
    '@id': `${absolute(p.path)}#pagina`,
    url: absolute(p.path),
    name: p.seo.title,
    description: p.seo.description,
    inLanguage: 'pt-BR',
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, url: SITE_URL, name: clinica.nome },
    about: { '@id': CLINIC_ID },
  };
}

/** Grafo completo de uma página, pronto para o `<script type="application/ld+json">`. */
export function graph(slug: string): Json {
  const p = page(slug);
  const nodes: Json[] = [webPage(p), medicalClinic()];
  if (p.tipo === 'landing' && !p.hub) nodes.push(procedureOrTest(p));
  const faq = faqPage(p);
  if (faq) nodes.push(faq);
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/**
 * Grafo de um post: BlogPosting + MedicalClinic.
 *
 * O autor é a clínica, não o RT — o texto é da casa, escrito e mantido pela
 * equipe. Assinar em nome dele seria dizer o que não é.
 */
export function grafoPost(post: Post): Json {
  const url = absolute(postPath(post));
  const t = page(post.tema);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#artigo`,
        url,
        mainEntityOfPage: url,
        headline: post.titulo,
        description: post.seo.description,
        inLanguage: 'pt-BR',
        datePublished: post.data,
        dateModified: post.atualizado,
        wordCount: post.blocos.reduce(
          (n, b) =>
            n +
            ('html' in b ? b.html : b.itens.join(' '))
              .replace(/<[^>]+>/g, ' ')
              .split(/\s+/)
              .filter(Boolean).length,
          0,
        ),
        author: { '@id': CLINIC_ID },
        publisher: { '@id': CLINIC_ID },
        about: { '@type': 'MedicalTest', name: t.nome, url: absolute(t.path) },
        isPartOf: {
          '@type': 'Blog',
          '@id': `${absolute(href('noticias'))}#blog`,
          name: `Notícias · ${clinica.nome}`,
          url: absolute(href('noticias')),
        },
      },
      medicalClinic(),
    ],
  };
}

export function breadcrumbPost(post: Post): Json {
  const items = [
    { name: 'Início', item: absolute('/') },
    { name: 'Notícias', item: absolute(href('noticias')) },
    { name: post.titulo, item: absolute(postPath(post)) },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

/** Breadcrumb das landings (hub → página). */
export function breadcrumb(p: Page): Json {
  const items = [
    { name: 'Início', item: absolute('/') },
    ...(p.grupo === 'proc' && !p.hub
      ? [{ name: 'Procedimentos guiados', item: absolute(href('hub')) }]
      : []),
    { name: p.curto, item: absolute(p.path) },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
