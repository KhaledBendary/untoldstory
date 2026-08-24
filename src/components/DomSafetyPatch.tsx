"use client";

import { useEffect } from "react";

/**
 * Softens React crashes when browser extensions (Bitdefender, Google Translate,
 * Grammarly, etc.) mutate the DOM under React's feet. Those tools inject or wrap
 * nodes; React then calls removeChild/insertBefore on a parent that no longer owns
 * the node, throwing NotFoundError.
 *
 * See: https://github.com/facebook/react/issues/11538
 */
export default function DomSafetyPatch() {
  useEffect(() => {
    if (typeof Node !== "function" || !Node.prototype) return;

    const w = window as unknown as { __domSafetyPatched?: boolean };
    if (w.__domSafetyPatched) return;
    w.__domSafetyPatched = true;

    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          return originalRemoveChild.call(child.parentNode, child) as T;
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return originalInsertBefore.call(this, newNode, null) as T;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }, []);

  return null;
}
