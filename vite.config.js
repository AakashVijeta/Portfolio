import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { projectDetails } from './src/data/projects.js'

const SITE_URL = 'https://aakashvijeta.me'
const NAME = 'Aakash Vijeta'
const TAGLINE = 'Machine learning, quant research and software engineering'
const DESCRIPTION =
  'Aakash Vijeta is a Data Science & AI undergraduate at IIT Guwahati building production machine-learning systems, quant trading research and reinforcement-learning agents.'
const GITHUB = 'https://github.com/AakashVijeta'
const LINKEDIN = 'https://www.linkedin.com/in/aakash-vijeta-1bb42b2b9'

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const absolute = (path) => new URL(path, SITE_URL).href

function structuredData() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: NAME,
    url: `${SITE_URL}/`,
    description: DESCRIPTION,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Indian Institute of Technology Guwahati' },
    knowsAbout: ['Machine Learning', 'Quantitative Research', 'Reinforcement Learning', 'Python', 'FastAPI', 'React'],
    sameAs: [GITHUB, LINKEDIN],
  }

  const projects = projectDetails.map((p) => ({
    '@type': 'SoftwareSourceCode',
    name: p.title,
    description: p.subtitle,
    genre: p.tag,
    image: absolute(p.image),
    codeRepository: p.repos?.[0]?.href,
    ...(p.liveDemo && { url: p.liveDemo }),
    keywords: p.techStack.join(', '),
    author: { '@id': `${SITE_URL}/#person` },
  }))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: NAME,
        description: DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#person` },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/#profile`,
        url: `${SITE_URL}/`,
        name: `${NAME} — ${TAGLINE}`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: person,
        hasPart: projects,
      },
    ],
  }
}

// Static markup shown before React mounts (createRoot replaces it). Gives
// crawlers that don't run JavaScript — and link-preview bots — real content.
function fallbackHtml() {
  const projects = projectDetails
    .map((p) => {
      const links = [
        p.liveDemo && `<a href="${escapeHtml(p.liveDemo)}">Live demo</a>`,
        ...(p.repos ?? []).map((r) => `<a href="${escapeHtml(r.href)}">${escapeHtml(r.label)}</a>`),
      ].filter(Boolean)
      return `
        <article>
          <h3>${escapeHtml(p.title)}</h3>
          <p><strong>${escapeHtml(p.tag)}</strong> — ${escapeHtml(p.subtitle)}</p>
          <p>Built with ${escapeHtml(p.techStack.join(', '))}.</p>
          <p>${links.join(' · ')}</p>
        </article>`
    })
    .join('')

  return `
      <main id="seo-fallback">
        <h1>${NAME}</h1>
        <p>${escapeHtml(DESCRIPTION)}</p>
        <section>
          <h2>Projects</h2>${projects}
        </section>
        <section>
          <h2>Contact</h2>
          <p><a href="${GITHUB}">GitHub</a> · <a href="${LINKEDIN}">LinkedIn</a></p>
        </section>
      </main>`
}

function seo() {
  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      const jsonLd = JSON.stringify(structuredData()).replace(/</g, '\\u003c')
      return html
        .replace('<!--seo:jsonld-->', `<script type="application/ld+json">${jsonLd}</script>`)
        .replace('<!--seo:fallback-->', fallbackHtml())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seo()],
   base: '/',
})
