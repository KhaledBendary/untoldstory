import postgres from 'postgres';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/DATABASE_URL=([^\r\n]+)/);
const sql = postgres(match[1].trim(), { ssl: 'require', prepare: false });

export function normalizeRedirectPath(p) {
  if (!p) return "";
  let clean = p.trim();
  try {
    clean = decodeURIComponent(clean);
  } catch {}
  clean = clean.normalize("NFC");
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);
  return clean;
}

const target17Pairs = [
  ['/zh/work/长安汽车道路安全企业社会责任营销活动-v2', '/zh/work/长安汽车超速与驾车使用手机企业社会责任活动'],
  ['/ru/work/csr-кампания-по-безопасности-дорожного-движе', '/ru/work/changan-кампания-скорость-и-телефон-за-рулём'],
  ['/pt/work/campanha-de-rse-de-segurança-no-trânsito-da-changan-v2', '/pt/work/campanha-rse-changan-velocidade-e-telemóvel-ao-volante'],
  ['/pl/work/kampania-csr-bezpieczeństwa-ruchu-drogowego-changan-v2', '/pl/work/kampania-csr-changan-prędkość-i-telefon-za-kierownicą'],
  ['/ko/work/changan-도로-안전-csr-캠페인-v2', '/ko/work/창안-과속-휴대폰-사용-csr-캠페인'],
  ['/ja/work/changan-道路交通安全-csr-キャンペーン-v2', '/ja/work/changan-スピード違反-ながらスマホ-csr-キャンペーン'],
  ['/fr/work/campagne-rse-de-sécurité-routière-changan-v2', '/fr/work/campagne-rse-changan-vitesse-et-téléphone-au-volant'],
  ['/es/work/campaña-de-rse-de-seguridad-vial-de-changan-v2', '/es/work/campaña-rse-changan-exceso-de-velocidad-y-móvil'],
  ['/ar/services/الرسوم-المتحركة-وإنتاج-3d', '/ar/services/رسوم-متحركة-وسي-جي-اي-ومؤثرات-بصرية-وذكاء-اص'],
  ['/ko/insights/왜-모든-브랜드는-사람들', '/ko/insights/모든-브랜드가-사람들의-마음을-움직이는-이야기를-필요로'],
  ['/ja/insights/なぜすべてのブランドには人々を動かすストーリ', '/ja/insights/すべてのブランドが人々を動かすストーリーを必要とする'],
  ['/ko/insights/이집트에서-미디어-제작-에ᄋ', '/ko/insights/이집트에서-미디어-제작-대행사를-선택하는-방법'],
  ['/ja/insights/エジプトのメディア制作サービス', '/ja/insights/エジプトメディア制作サービス'],
  ['/ja/insights/映画的ブランドストーリーテリング', '/ja/insights/シネマティックブランドストーリーテリング'],
  ['/ja/work/ヒュンダイアルマジュディエ日々の分割払いキャン', '/ja/work/ヒョンデ-アル-マジュドゥイエ-日払い分割払いキャンペー'],
  ['/ja/work/フォーシーズンズカイロのソーシャルメディアフィ', '/ja/work/フォーシーズンズ-カイロ-ソーシャルメディア-フィルム'],
  ['/ja/work/エズエララブスターオートモーティブブランド', '/ja/work/ezz-elarab-star-自動車ブランドフィルム']
];

async function migrate() {
  console.log('Fetching all redirects from database...');
  const rows = await sql`SELECT id, from_path, to_path FROM redirects`;
  console.log(`Loaded ${rows.length} rows.`);

  let updatedCount = 0;

  // 1. Normalize all rows to NFC and decoded URI
  for (const r of rows) {
    const normFrom = normalizeRedirectPath(r.from_path);
    const normTo = normalizeRedirectPath(r.to_path);

    if (normFrom !== r.from_path || normTo !== r.to_path) {
      console.log(`Normalizing row [id ${r.id}]:`);
      console.log(`  from: ${r.from_path} -> ${normFrom}`);
      console.log(`  to:   ${r.to_path} -> ${normTo}`);
      
      // Delete any conflicting row with normFrom
      await sql`DELETE FROM redirects WHERE from_path = ${normFrom} AND id != ${r.id}`;
      await sql`UPDATE redirects SET from_path = ${normFrom}, to_path = ${normTo} WHERE id = ${r.id}`;
      updatedCount++;
    }
  }
  console.log(`Normalized ${updatedCount} rows to NFC.`);

  // 2. Ensure all 17 target pairs exist with exact values
  console.log('\nEnsuring the 17 target pairs in DB...');
  for (const [from, to] of target17Pairs) {
    const normFrom = normalizeRedirectPath(from);
    const normTo = normalizeRedirectPath(to);

    const existing = await sql`SELECT id, from_path, to_path FROM redirects WHERE from_path = ${normFrom}`;
    if (existing.length > 0) {
      if (existing[0].to_path !== normTo) {
        console.log(`Updating [id ${existing[0].id}]: ${normFrom} -> ${normTo} (was: ${existing[0].to_path})`);
        await sql`UPDATE redirects SET to_path = ${normTo} WHERE id = ${existing[0].id}`;
      } else {
        console.log(`OK: ${normFrom} -> ${normTo}`);
      }
    } else {
      console.log(`Inserting missing pair: ${normFrom} -> ${normTo}`);
      await sql`INSERT INTO redirects (from_path, to_path) VALUES (${normFrom}, ${normTo})`;
    }
  }

  // 3. Resolve redirect chains (A -> B, B -> C  =>  A -> C)
  console.log('\nResolving chained redirects...');
  const freshRows = await sql`SELECT id, from_path, to_path FROM redirects`;
  const redirectMap = new Map();
  for (const r of freshRows) {
    redirectMap.set(r.from_path, r.to_path);
  }

  // Helper to find terminal destination
  function findFinalDestination(startPath) {
    let curr = startPath;
    const visited = new Set();
    while (redirectMap.has(curr)) {
      if (visited.has(curr)) break; // loop prevention
      visited.add(curr);
      curr = redirectMap.get(curr);
    }
    return curr;
  }

  let unchainedCount = 0;
  for (const r of freshRows) {
    const finalDest = findFinalDestination(r.to_path);
    if (finalDest !== r.to_path) {
      console.log(`Unchaining [id ${r.id}]: ${r.from_path} -> ${r.to_path} => NEW TARGET: ${finalDest}`);
      await sql`UPDATE redirects SET to_path = ${finalDest} WHERE id = ${r.id}`;
      redirectMap.set(r.from_path, finalDest);
      unchainedCount++;
    }
  }
  console.log(`Resolved ${unchainedCount} chained redirects.`);

  // 4. Export all final redirects to slug-dictionary.json
  console.log('\nSyncing all DB redirects into src/data/slug-dictionary.json...');
  const finalDbRows = await sql`SELECT from_path, to_path FROM redirects ORDER BY id`;
  const slugDictPath = 'src/data/slug-dictionary.json';
  const dict = JSON.parse(fs.readFileSync(slugDictPath, 'utf8'));

  if (!dict.pathRedirects) dict.pathRedirects = {};

  for (const r of finalDbRows) {
    const normFrom = normalizeRedirectPath(r.from_path);
    const normTo = normalizeRedirectPath(r.to_path);
    dict.pathRedirects[normFrom] = normTo;
    dict.pathRedirects[normFrom.toLowerCase()] = normTo;
  }

  fs.writeFileSync(slugDictPath, JSON.stringify(dict, null, 2), 'utf8');
  console.log(`Successfully synced ${finalDbRows.length} redirects to ${slugDictPath}`);

  await sql.end();
}

migrate().catch(console.error);
