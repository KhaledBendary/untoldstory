const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const draftPath = path.join(root, '.on-ground-egypt-five-locales-draft.json');
const outputPath = path.join(root, '.on-ground-egypt-five-locales-import.json');
const sourceUrl = 'https://api.globaluntoldstory.com/api/v1/services/on-ground-egypt?locale=en';

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Source API returned HTTP ${response.statusCode}.`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Source API returned invalid JSON: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function plainText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function translationBlocks(draft, locale) {
  return Object.values(draft.sections)
    .sort((a, b) => a.source_block_range[0] - b.source_block_range[0])
    .flatMap((section) => section[locale]);
}

function localizeHtml(sourceHtml, translatedBlocks) {
  let blockIndex = 0;
  const localizedHtml = sourceHtml.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (paragraph, innerHtml) => {
    if (!plainText(innerHtml)) return paragraph;

    const tokens = innerHtml.split(/(<[^>]+>)/g);
    const contentIndexes = tokens
      .map((token, index) => ({ token, index }))
      .filter(({ token }) => !/^<[^>]+>$/.test(token) && plainText(token));

    if (blockIndex >= translatedBlocks.length) {
      throw new Error('The translation draft has fewer blocks than the English source.');
    }

    const translatedParts = translatedBlocks[blockIndex].split(' | ');
    const hasLineBreaks = /<br\s*\/?>/i.test(innerHtml);
    if (translatedParts.length === 1 && contentIndexes.length > 1 && !hasLineBreaks) {
      tokens[contentIndexes[0].index] = escapeHtml(translatedParts[0]);
      contentIndexes.slice(1).forEach(({ index }) => { tokens[index] = ''; });
    } else if (translatedParts.length !== contentIndexes.length) {
      throw new Error(`Paragraph ${blockIndex + 1} has ${contentIndexes.length} text nodes but the translation has ${translatedParts.length} matching parts; refusing to alter its formatting.`);
    } else {
      contentIndexes.forEach(({ index }, textIndex) => {
        tokens[index] = escapeHtml(translatedParts[textIndex]);
      });
    }
    blockIndex += 1;
    return paragraph.replace(innerHtml, tokens.join(''));
  });

  if (blockIndex !== translatedBlocks.length) {
    throw new Error(`The English source has ${blockIndex} non-empty paragraphs but the draft has ${translatedBlocks.length} blocks.`);
  }
  return localizedHtml;
}

async function main() {
  const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
  if (draft.status !== 'reviewed-ready-for-package') throw new Error('Draft has not completed review.');

  const response = await getJson(sourceUrl);
  const source = response?.data;
  if (!source?.fullDesc || !source?.title || !source?.shortDesc) throw new Error('Source API response is incomplete.');

  const expectedBlockCount = 149;
  const payload = {
    schema_version: 1,
    service_slug: draft.service_slug,
    source: {
      locale: draft.source_locale,
      full_desc_sha256: crypto.createHash('sha256').update(source.fullDesc, 'utf8').digest('hex'),
      non_empty_paragraph_count: expectedBlockCount,
    },
    translations: {},
  };

  for (const locale of draft.locales) {
    const blocks = translationBlocks(draft, locale);
    if (blocks.length !== expectedBlockCount) throw new Error(`${locale} has ${blocks.length} blocks, expected ${expectedBlockCount}.`);
    const fields = draft.service_fields?.[locale];
    if (!fields?.title || !fields?.short_desc) throw new Error(`${locale} is missing service-card fields.`);
    payload.translations[locale] = {
      title: fields.title,
      short_desc: fields.short_desc,
      full_desc: localizeHtml(source.fullDesc, blocks),
      price: source.price || '',
    };
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Created ${path.basename(outputPath)} for ${Object.keys(payload.translations).length} locales.`);
  console.log(`Source hash: ${payload.source.full_desc_sha256}`);
  console.log(`Paragraphs per locale: ${payload.source.non_empty_paragraph_count}`);
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});
