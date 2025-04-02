"use client";

import React, { useEffect, useState } from "react";
import { usePageViewCounter } from "../hooks/usePageViewsCounter";
import { getCookie, setCookie } from "../utility";

type ConsentStatus = "accepted" | "rejected" | "missing";

export const CookieBanner = () => {
  const { incrementPageView } = usePageViewCounter();
  const [consent, setConsent] = useState<ConsentStatus>("missing");

  useEffect(() => {
    const savedConsent = getCookie("cookie_consent") as ConsentStatus | null;
    setConsent(savedConsent === "accepted" || savedConsent === "rejected" ? savedConsent : "missing");
  }, []);

  const updateConsent = (status: ConsentStatus) => {
    setCookie("cookie_consent", status, 365);
    setConsent(status);
    if (status === "accepted") incrementPageView(); // Start tracking immediately
  };

  if (consent !== "missing") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex justify-between items-center">
      <p>This website uses cookies to improve your experience.</p>
      <div>
        <button onClick={() => updateConsent("accepted")} className="bg-green-600 px-4 py-2 mr-2">
          Accept
        </button>
        <button onClick={() => updateConsent("rejected")} className="bg-red-600 px-4 py-2">
          Reject
        </button>
      </div>
    </div>
  );
};
