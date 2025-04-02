"use client";

import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../utility";

// Token Storage Type
type TokenStorage = {
  token: string;
  createdAt: number;
};

// Check if token is expired
const isTokenExpired = (createdAt: number): boolean => {
  const tokenLifetime = 3600 * 1000; // 1 hour in milliseconds
  return Date.now() - createdAt > tokenLifetime;
};

// Get API URL
const getApiUrl = (apiPath: string) => {
  const serverHost = window.location.hostname === "localhost" ? "https://staging.prefetch.io" : "https://prefetch.io";
  const height = window.screen.height;
  const width = window.screen.width;
  const searchParams = new URLSearchParams({
    h: height.toString(),
    w: width.toString(),
    l: navigator.language,
    u: navigator.userAgent,
  });
  return `${serverHost}${apiPath}?${searchParams.toString()}`;
};

// Fetch new token
const fetchNewToken = async (): Promise<TokenStorage | null> => {
  const apiPath = "/api/v1/token";
  const apiUrl = getApiUrl(apiPath);
  const tokenResponse = await fetch(apiUrl);
  const tokenData = await tokenResponse.json();
  if (tokenData.token) {
    const tokenObject: TokenStorage = {
      token: tokenData.token,
      createdAt: Date.now(),
    };
    setCookie("token", JSON.stringify(tokenObject), 1); // Store for 1 hour
    return tokenObject;
  }
  return null;
};

// Get token
const getToken = async (): Promise<string | null> => {
  let tokenData: TokenStorage | null = null;
  const tokenString = getCookie("token");
  if (tokenString) {
    try {
      tokenData = JSON.parse(tokenString);
    } catch (error) {
      tokenData = null;
    }
  }
  if (!tokenData || isTokenExpired(tokenData.createdAt)) {
    tokenData = await fetchNewToken();
  }
  return tokenData?.token || null;
};

// Increment page view count
const incrementPageView = async () => {
  const token = await getToken();
  if (!token) return;

  const pathname = window.location.pathname;
  const pageId = pathname
    .split("/")
    .filter((x) => x)
    .join("-");
  const incrementApiPath = `/api/v1/pageviews/${pageId}/increment`;
  const incrementApiUrl = getApiUrl(incrementApiPath);

  try {
    const countResponse = await fetch(incrementApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const countData = await countResponse.json();
    return countData.count;
  } catch (error) {
    console.error("Error incrementing page views:", error);
  }
};

// Hook to use page view counter
export function usePageViewCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchAndIncrement = async () => {
      try {
        const newCount = await incrementPageView();
        if (newCount !== null) setCount(newCount);
      } catch (error) {
        console.error("Error fetching page view count:", error);
      }
    };

    if (getCookie("cookie_consent") === "accepted") {
      debugger;
      fetchAndIncrement();
    }
  }, []);

  return { count, incrementPageView };
}
