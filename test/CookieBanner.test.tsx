import { CookieBanner } from "@/components/CookieBanner";
import { usePageViewCounter } from "@/hooks/usePageViewsCounter";
import { getCookie, setCookie } from "@/utility";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

jest.mock("@/utility", () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
}));

jest.mock("@/hooks/usePageViewsCounter", () => ({
  usePageViewCounter: jest.fn(),
}));

describe("CookieBanner", () => {
  let incrementPageView: jest.Mock;

  beforeEach(() => {
    incrementPageView = jest.fn();
    (usePageViewCounter as jest.Mock).mockReturnValue({ incrementPageView });

    jest.clearAllMocks();
  });

  it("displays the banner when consent is missing", () => {
    (getCookie as jest.Mock).mockReturnValue(null);

    render(<CookieBanner />);

    expect(screen.getByText(/this website uses cookies/i)).toBeInTheDocument();
  });

  it("does not display the banner if consent is accepted", () => {
    (getCookie as jest.Mock).mockReturnValue("accepted");

    render(<CookieBanner />);

    expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
  });

  it("does not display the banner if consent is rejected", () => {
    (getCookie as jest.Mock).mockReturnValue("rejected");

    render(<CookieBanner />);

    expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
  });

  it("accepts cookies, sets consent, and increments page view", () => {
    (getCookie as jest.Mock).mockReturnValue(null);

    render(<CookieBanner />);

    fireEvent.click(screen.getByText(/accept/i));

    expect(setCookie).toHaveBeenCalledWith("cookie_consent", "accepted", 365);
    expect(incrementPageView).toHaveBeenCalled();
    expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
  });

  it("rejects cookies and sets consent", () => {
    (getCookie as jest.Mock).mockReturnValue(null);

    render(<CookieBanner />);

    fireEvent.click(screen.getByText(/reject/i));

    expect(setCookie).toHaveBeenCalledWith("cookie_consent", "rejected", 365);
    expect(incrementPageView).not.toHaveBeenCalled();
    expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
  });
});
