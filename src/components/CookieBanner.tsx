"use client";

import React, { useEffect, useState } from "react";
import { usePageViewCounter } from "../hooks/usePageViewsCounter";
import { getCookie, setCookie } from "../utility";

type ConsentStatus = "accepted" | "rejected" | "missing";

export const CookieBanner = () => {
  const { incrementPageView } = usePageViewCounter();
  const [consent, setConsent] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    const savedConsent = getCookie("cookie_consent") as ConsentStatus | null;
    setConsent(savedConsent === "accepted" || savedConsent === "rejected" ? savedConsent : "missing");
  }, []);

  const updateConsent = (status: ConsentStatus) => {
    setCookie("cookie_consent", status, 365);
    setConsent(status);
    if (status === "accepted") incrementPageView();
  };

  if (consent === null) return null;

  if (consent !== "missing") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1F2937",
        color: "white",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <p>This website uses cookies to improve your experience.</p>
      <div>
        <button
          onClick={() => updateConsent("accepted")}
          style={{
            backgroundColor: "#16A34A",
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
          }}
        >
          Accept
        </button>
        <button
          onClick={() => updateConsent("rejected")}
          style={{
            backgroundColor: "#DC2626",
            padding: "0.5rem 1rem",
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};
