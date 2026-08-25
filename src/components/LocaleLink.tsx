"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "./LanguageContext";
import { localizedPath } from "@/lib/i18n";

type Props = ComponentProps<typeof NextLink>;

/**
 * next/link that keeps the visitor in their language.
 *
 * Internal hrefs get the active locale's prefix, so clicking through from
 * /ar/services no longer drops back into English. External links, anchors and
 * mailto/tel are passed through untouched.
 */
export default function LocaleLink({ href, ...rest }: Props) {
  const { locale } = useLanguage();

  if (typeof href === "string" && href.startsWith("/") && !href.startsWith("//")) {
    return <NextLink href={localizedPath(href, locale)} {...rest} />;
  }
  return <NextLink href={href} {...rest} />;
}
