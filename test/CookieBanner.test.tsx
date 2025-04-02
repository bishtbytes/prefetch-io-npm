import { CookieBanner } from "@/components/CookieBanner";
import { usePageViewCounter } from "@/hooks/usePageViewsCounter";
import { getCookie, setCookie } from "@/utility";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
  });

  const simulateScroll = (scrollY: number) => {
    act(() => {
      window.scrollY = scrollY;
      window.dispatchEvent(new Event("scroll"));
    });
  };

  describe("default variant with showOnScroll", () => {
    it("renders but is not visible initially when consent is missing and showOnScroll is true", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner />);

      const bannerText = screen.getByText(/this website uses cookies/i);
      expect(bannerText).toBeInTheDocument(); // Present in DOM
      expect(bannerText).not.toBeVisible(); // Not visible to user
    });

    it("becomes visible after scrolling when consent is missing and showOnScroll is true", async () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner />);

      simulateScroll(60);

      await waitFor(() => {
        const bannerText = screen.getByText(/this website uses cookies/i);
        expect(bannerText).toBeVisible();
        expect(screen.getByRole("button", { name: /accept/i })).toBeVisible();
        expect(screen.getByRole("button", { name: /reject/i })).toBeVisible();
      });
    });

    it("is visible immediately when consent is missing and showOnScroll is false", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner showOnScroll={false} />);

      const bannerText = screen.getByText(/this website uses cookies/i);
      expect(bannerText).toBeVisible();
      expect(screen.getByRole("button", { name: /accept/i })).toBeVisible();
      expect(screen.getByRole("button", { name: /reject/i })).toBeVisible();
    });

    it("does not render if consent is accepted, regardless of showOnScroll", () => {
      (getCookie as jest.Mock).mockReturnValue("accepted");

      render(<CookieBanner />);
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();

      render(<CookieBanner showOnScroll={false} />);
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
    });

    it("does not render if consent is rejected, regardless of showOnScroll", () => {
      (getCookie as jest.Mock).mockReturnValue("rejected");

      render(<CookieBanner />);
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();

      render(<CookieBanner showOnScroll={false} />);
      expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
    });

    it("accepts cookies, sets consent, and increments page view after scroll", async () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner />);

      simulateScroll(60);

      await waitFor(() => {
        const acceptButton = screen.getByRole("button", { name: /accept/i });
        act(() => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(setCookie).toHaveBeenCalledWith("cookie_consent", "accepted", 365);
        expect(incrementPageView).toHaveBeenCalled();
        expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
      });
    });

    it("rejects cookies and sets consent after scroll", async () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner />);

      simulateScroll(60);

      await waitFor(() => {
        const rejectButton = screen.getByRole("button", { name: /reject/i });
        act(() => {
          fireEvent.click(rejectButton);
        });
      });

      await waitFor(() => {
        expect(setCookie).toHaveBeenCalledWith("cookie_consent", "rejected", 365);
        expect(incrementPageView).not.toHaveBeenCalled();
        expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("lean variant with showOnScroll", () => {
    it("renders but is not visible initially when consent is missing and showOnScroll is true", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner variant="lean" />);

      const bannerText = screen.getByText(/this website uses cookies/i);
      expect(bannerText).toBeInTheDocument();
      expect(bannerText).not.toBeVisible();
    });

    it("becomes visible with lean message after scrolling when consent is missing", async () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner variant="lean" />);

      simulateScroll(60);

      await waitFor(() => {
        const bannerText = screen.getByText(/this website uses cookies/i);
        expect(bannerText).toBeVisible();
        expect(screen.getByText(/accept to allow cookies/i)).toBeVisible();
        expect(screen.getByRole("button", { name: /accept/i })).toBeVisible();
        expect(screen.getByRole("button", { name: /reject/i })).toBeVisible();
      });
    });

    it("is visible immediately with lean message when showOnScroll is false", () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner variant="lean" showOnScroll={false} />);

      const bannerText = screen.getByText(/this website uses cookies/i);
      expect(bannerText).toBeVisible();
      expect(screen.getByText(/accept to allow cookies/i)).toBeVisible();
      expect(screen.getByRole("button", { name: /accept/i })).toBeVisible();
      expect(screen.getByRole("button", { name: /reject/i })).toBeVisible();
    });

    it("accepts cookies, sets consent, and increments page view after scroll", async () => {
      (getCookie as jest.Mock).mockReturnValue(null);

      render(<CookieBanner variant="lean" />);

      simulateScroll(60);

      await waitFor(() => {
        const acceptButton = screen.getByRole("button", { name: /accept/i });
        act(() => {
          fireEvent.click(acceptButton);
        });
      });

      await waitFor(() => {
        expect(setCookie).toHaveBeenCalledWith("cookie_consent", "accepted", 365);
        expect(incrementPageView).toHaveBeenCalled();
        expect(screen.queryByText(/this website uses cookies/i)).not.toBeInTheDocument();
      });
    });
  });
});
