export default function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  let payload: Record<string, unknown>;

  if (Array.isArray(data)) {
    const validItems = data.filter(Boolean);
    if (validItems.length === 1) {
      payload = validItems[0];
    } else {
      payload = {
        "@context": "https://schema.org",
        "@graph": validItems.map((item) => {
          const { "@context": _ctx, ...rest } = item;
          return rest;
        }),
      };
    }
  } else {
    payload = data;
    if (!payload["@context"]) {
      payload = { "@context": "https://schema.org", ...payload };
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}
