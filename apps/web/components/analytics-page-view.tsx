"use client";

import { useEffect, useRef } from "react";
import type { AnalyticsEventName } from "@/lib/analytics";

export function AnalyticsPageView(props: {
  name: AnalyticsEventName;
  route: string;
  path: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    const payload = JSON.stringify({
      name: props.name,
      route: props.route,
      path: props.path,
      entityType: props.entityType,
      entityId: props.entityId,
      metadata: props.metadata
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], {
        type: "application/json"
      });
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: payload,
      keepalive: true
    });
  }, [props.entityId, props.entityType, props.metadata, props.name, props.path, props.route]);

  return null;
}
