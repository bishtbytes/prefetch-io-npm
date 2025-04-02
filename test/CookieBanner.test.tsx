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

  describe("default variant", () => {
    it("displays the banner when consent is missing", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner />);

      expect(screen.getByText(/this website uses cookies/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
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

      const acceptButton = screen.getByRole("button", { name: /accept/i });
      fireEvent.click(acceptButton);

      expect(setCookie).toHaveBeenCalledWith("cookie_consent", "accepted", 365);
      expect(incrementPageView).toHaveBeenCalled();
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
    });

    it("rejects cookies and sets consent", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner />);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      fireEvent.click(rejectButton);

      expect(setCookie).toHaveBeenCalledWith("cookie_consent", "rejected", 365);
      expect(incrementPageView).not.toHaveBeenCalled();
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
    });
  });

  describe("lean variant", () => {
    it("displays the banner with lean message when consent is missing", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner variant="lean" />);

      expect(screen.getByText(/this website uses cookies/i)).toBeInTheDocument();
      expect(screen.getByText(/accept to allow cookies/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    });

    it("does not display the banner if consent is accepted", () => {
      (getCookie as jest.Mock).mockReturnValue("accepted");

      render(<CookieBanner variant="lean" />);

      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
    });

    it("accepts cookies, sets consent, and increments page view", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner variant="lean" />);

      const acceptButton = screen.getByRole("button", { name: /accept/i });
      fireEvent.click(acceptButton);

      expect(setCookie).toHaveBeenCalledWith("cookie_consent", "accepted", 365);
      expect(incrementPageView).toHaveBeenCalled();
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
    });
  });
});
