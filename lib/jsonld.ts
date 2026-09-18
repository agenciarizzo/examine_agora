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

/**
 * O responsável técnico tem nó PRÓPRIO, com @id, e não mais um `employee`
 * anônimo dentro da clínica.
 *
 * O perfil de centro de diagnóstico por imagem pede `Physician` por membro do
 * corpo clínico — aqui é um só, e é ele quem assina o laudo. Nó anônimo não
 * pode ser referenciado, não carrega CRM e RQE separados e não aparece em
 * resposta de IA; com @id, a página do RT, os exames e a clínica passam a
 * apontar para a MESMA pessoa.
 */
export const PHYSICIAN_ID = `${SITE_URL}/#rt`;

/** Endereço da clínica — um lugar só, usado pela clínica e pelo RT. */
const ENDERECO = {
  '@type': 'PostalAddress',
  streetAddress: 'Av. Recanto das Emas, Q102 L03 Loja 06',
  addressLocality: 'Recanto das Emas',
  addressRegion: 'DF',
  addressCountry: 'BR',
} as const;

/**
 * CRM e RQE entram como `PropertyValue` separados, não numa string só: é
 * assim que um validador (e um buscador) consegue ler o registro como
 * registro, e não como texto solto.
 */
export function physician(): Json {
  const [crmDf, crmSp] = clinica.rt.crm.split(' · ');
  return {
    '@type': 'Physician',
    '@id': PHYSICIAN_ID,
    name: clinica.rt.name,
    honorificPrefix: 'Dr.',
    jobTitle: 'Responsável técnico',
    medicalSpecialty: 'Radiography',
    url: absolute(href('sobre')),
    image: absolute('/dr-flavio.webp'),
    description: clinica.rt.bio,
    address: ENDERECO,
    worksFor: { '@id': CLINIC_ID },
    identifier: [
      { '@type': 'PropertyValue', name: 'CRM', value: crmDf },
      ...(crmSp ? [{ '@type': 'PropertyValue', name: 'CRM', value: crmSp }] : []),
      { '@type': 'PropertyValue', name: 'RQE', value: clinica.rt.rqe },
    ],
  };
}

export function medicalClinic(): Json {
  return {
    '@type': 'MedicalClinic',
    '@id': CLINIC_ID,
    name: clinica.nome,
    url: SITE_URL,
    telephone: clinica.phone,
    medicalSpecialty: 'Radiography',
    /*
     * `sameAs` é o que amarra o perfil do Instagram e o do Facebook À MESMA
     * entidade que o site descreve. Os dois links já existiam no json (e no
     * topbar) e ficavam de fora do schema — o buscador via três presenças
     * soltas em vez de uma clínica só.
     */
    sameAs: [clinica.instagram, clinica.facebook],
    address: ENDERECO,
    areaServed: [
      { '@type': 'Place', name: 'Recanto das Emas · Brasília-DF' },
      { '@type': 'Place', name: 'Riacho Fundo II · Brasília-DF' },
    ],
    openingHoursSpecification: OPENING_HOURS,
    paymentAccepted: clinica.pagamento,
    hasMap: 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('Examine Agora, ' + clinica.address.replace(/ · /g, ', ')),
    employee: { '@id': PHYSICIAN_ID },
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
  const nodes: Json[] = [webPage(p), medicalClinic(), physician()];
  if (p.tipo === 'landing' && !p.hub) nodes.push(procedureOrTest(p));
  const faq = faqPage(p);
  if (faq) nodes.push(faq);
  // A home é a raiz: rota raiz não tem trilha. Todas as outras têm.
  if (p.path !== '/') nodes.push(breadcrumb(p));
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

/**
 * Breadcrumb de QUALQUER rota aninhada — landing, página do site ou legal.
 *
 * A regra do padrão da casa não tem exceção: rota aninhada leva
 * `BreadcrumbList`. Antes daqui só as 12 landings tinham; `/preparos`,
 * `/convenios`, `/sobre-nos`, `/agende-seu-exame`, `/noticias` e as 3 páginas
 * legais ficavam sem — 8 rotas que o buscador via soltas, sem caminho de volta
 * para a home.
 */
export function breadcrumb(p: Page): Json {
  const items = [
    { name: 'Início', item: absolute('/') },
    ...(p.grupo === 'proc' && !p.hub
      ? [{ name: 'Procedimentos guiados', item: absolute(href('hub')) }]
      : []),
    { name: p.curto, item: absolute(p.path) },
  ];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(p.path)}#trilha`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}
