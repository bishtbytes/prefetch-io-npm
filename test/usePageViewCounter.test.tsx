import { usePageViewCounter } from "@/hooks/usePageViewsCounter"; // Adjust path as needed
import { getCookie, setCookie } from "@/utility";
import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";

// Mock dependencies
jest.mock("@/utility", () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe("usePageViewCounter", () => {
  const mockDateNow = 1234567890000; // Fixed timestamp for consistency

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() specifically
    jest.spyOn(global.Date, "now").mockReturnValue(mockDateNow);
    delete (window as any).location;
    window.location = { pathname: "/test/path" } as any;
    (window.screen as any) = { height: 1080, width: 1920 };
    (navigator as any) = { language: "en-US", userAgent: "test-agent" };
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore Date.now() after each test
  });

  it("does not fetch or increment if cookie_consent is not 'accepted'", async () => {
    (getCookie as jest.Mock).mockReturnValue("rejected");

    const { result } = renderHook(() => usePageViewCounter());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.count).toBe(0);
  });

  it("fetches and increments page view when cookie_consent is 'accepted' and no token exists", async () => {
    (getCookie as jest.Mock)
      .mockReturnValueOnce("accepted") // cookie_consent
      .mockReturnValueOnce(null); // token

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ token: "new-token" }),
      }) // fetchNewToken
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ count: 42 }),
      }); // incrementPageView

    const { result } = renderHook(() => usePageViewCounter());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(setCookie).toHaveBeenCalledWith("token", JSON.stringify({ token: "new-token", createdAt: mockDateNow }), 1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/pageviews/test-path/increment"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "new-token" }),
      })
    );
    expect(result.current.count).toBe(42);
  });

  it("uses existing valid token without fetching a new one", async () => {
    const validToken = {
      token: "existing-token",
      createdAt: mockDateNow - 1000, // 1 second old, not expired
    };
    (getCookie as jest.Mock)
      .mockReturnValueOnce("accepted") // cookie_consent
      .mockReturnValueOnce(JSON.stringify(validToken)); // token

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ count: 10 }),
    }); // incrementPageView

    const { result } = renderHook(() => usePageViewCounter());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/pageviews/test-path/increment"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "existing-token" }),
      })
    );
    expect(setCookie).not.toHaveBeenCalled();
    expect(result.current.count).toBe(10);
  });

  it("fetches new token if existing token is expired", async () => {
    const expiredToken = {
      token: "old-token",
      createdAt: mockDateNow - 3601 * 1000, // Over 1 hour old, expired
    };
    (getCookie as jest.Mock)
      .mockReturnValueOnce("accepted") // cookie_consent
      .mockReturnValueOnce(JSON.stringify(expiredToken)); // token

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ token: "new-token" }),
      }) // fetchNewToken
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ count: 15 }),
      }); // incrementPageView

    const { result } = renderHook(() => usePageViewCounter());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(setCookie).toHaveBeenCalledWith("token", JSON.stringify({ token: "new-token", createdAt: mockDateNow }), 1);
    expect(result.current.count).toBe(15);
  });

  it("handles fetch errors gracefully", async () => {
    (getCookie as jest.Mock)
      .mockReturnValueOnce("accepted") // cookie_consent
      .mockReturnValueOnce(null); // token

    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Token fetch failed"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => usePageViewCounter());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching page view count:", expect.any(Error));
    expect(result.current.count).toBe(0);
    consoleErrorSpy.mockRestore();
  });

  it("incrementPageView increments count manually", async () => {
    (getCookie as jest.Mock).mockReturnValue(null); // No initial token
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ token: "manual-token" }),
      }) // fetchNewToken
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ count: 7 }),
      }); // incrementPageView

    const { result } = renderHook(() => usePageViewCounter());

    await act(async () => {
      await result.current.incrementPageView(); // Manual call
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(setCookie).toHaveBeenCalledWith(
      "token",
      JSON.stringify({ token: "manual-token", createdAt: mockDateNow }),
      1
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/pageviews/test-path/increment"),
      expect.any(Object)
    );
    expect(result.current.count).toBe(0); // Manual call doesn't update state
  });
});
