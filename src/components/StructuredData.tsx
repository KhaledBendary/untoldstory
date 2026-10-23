export default function StructuredData({
  data,
}: {
  data?: Record<string, unknown> | Record<string, unknown>[] | null;
}) {
  if (!data) return null;

  try {
    let payload: Record<string, unknown>;

    if (Array.isArray(data)) {
      const validItems = data.filter(
        (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
      );
      if (!validItems.length) return null;
      if (validItems.length === 1) {
        payload = { ...validItems[0] };
        if (!payload["@context"]) {
          payload["@context"] = "https://schema.org";
        }
      } else {
        payload = {
          "@context": "https://schema.org",
          "@graph": validItems.map((item) => {
            const copy = { ...item };
            delete copy["@context"];
            return copy;
          }),
        };
      }
    } else if (typeof data === "object") {
      payload = { ...data };
      if (!payload["@context"]) {
        payload["@context"] = "https://schema.org";
      }
    } else {
      return null;
    }

    const json = JSON.stringify(payload);
    if (!json || json === "{}" || json === "null") return null;

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
      />
    );
  } catch (e) {
    console.error("StructuredData rendering error:", e);
    return null;
  }
}
