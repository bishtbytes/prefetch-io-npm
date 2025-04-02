"use client";

import React, { useEffect, useState } from "react";
import { usePageViewCounter } from "../hooks/usePageViewsCounter";
import { getCookie, setCookie } from "../utility";

type ConsentStatus = "accepted" | "rejected" | "missing";
type CookieBannerProps = {
  variant?: "default" | "lean";
};

const COOKIE_MESSAGE_DEFAULT =
  "This website uses cookies to enhance your experience, analyze site traffic, and personalize content. By clicking Accept, you agree to the use of cookies. If you choose to reject, some site functionalities may not work properly.";

const COOKIE_MESSAGE_LEAN =
  "This website uses cookies to enhance your experience. Accept to allow cookies or reject for limited functionality.";

export const CookieBanner = ({ variant = "default" }: CookieBannerProps) => {
  const bannerClass = `cookie-banner ${variant === "lean" ? "lean" : "default"}`;
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

  if (consent === null || consent !== "missing") return null;

  return (
    <>
      <div className={bannerClass}>
        <p className="cookie-text">{variant === "lean" ? COOKIE_MESSAGE_LEAN : COOKIE_MESSAGE_DEFAULT}</p>
        <div className="cookie-buttons">
          <button onClick={() => updateConsent("rejected")} className="cookie-button reject">
            Reject
          </button>
          <button onClick={() => updateConsent("accepted")} className="cookie-button accept">
            Accept
          </button>
        </div>
      </div>
      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background-color: white;
          color: black;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 1111;
        }

        .default {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 4px solid black;
        }

        .lean {
          min-width: 800px;
          max-width: 900px;
          left: 50%;
          transform: translateX(-50%);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid black;
        }

        .lean .cookie-text {
          margin-right: 8px;
          font-size: 1rem;
          line-height: 1.4;
        }

        .default .cookie-text {
          max-width: 800px;
          line-height: 1.5;
          text-align: center;
          font-size: 1.1rem;
        }

        .default .cookie-buttons {
          margin-top: 1.5rem;
          display: flex;
          gap: 1rem;
        }

        .lean .cookie-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .lean .cookie-button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          border: 1px solid black;
        }

        .default .cookie-button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          border-radius: 8px;
          border: 2px solid black;
        }

        .accept {
          background-color: black;
          color: white;
        }

        .reject {
          background-color: white;
          color: black;
        }

        @media (max-width: 800px) {
          .cookie-banner {
            left: 5%;
            right: 5%;
            width: auto;
          }

          .lean {
            min-width: 0;
            padding: 1rem;
            flex-direction: column;
          }

          .lean .cookie-text {
            max-width: 100%;
            text-align: center;
          }

          .lean .cookie-buttons {
            margin-top: 1rem;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }

          .lean .cookie-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};
