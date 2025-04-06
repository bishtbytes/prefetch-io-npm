import { configurePageIds } from "@/configure";

global.fetch = jest.fn();

describe("configurePageIds", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...process.env };
  });

  it("successfully configures page IDs with valid environment variables", async () => {
    process.env.PREFETCH_IO_URL = "https://example.com";
    process.env.CLIENT_ID = "test-client-id";
    process.env.CLIENT_SECRET = "test-client-secret";
    process.env.SITE_ADDRESS = "https://my-site.com";

    const mockResponse = { success: true };
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    await configurePageIds(["page1", "page2"]);

    // Expect only one console.log call
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, "Updated configuration:", mockResponse);

    expect(fetch).toHaveBeenCalledWith("https://example.com/api/v1/configure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        referer: "https://my-site.com",
      },
      body: JSON.stringify({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        rateLimitWindow: 60,
        useAccessToken: true,
        accessTokenValidity: 3600,
        rateLimitPerEntityId: 1,
        validPageIds: ["page1", "page2"],
        validActionIds: ["pageviews"],
      }),
    });

    consoleLogSpy.mockRestore();
  });

  it("throws an error when required environment variables are missing", async () => {
    delete process.env.PREFETCH_IO_URL;
    delete process.env.CLIENT_ID;
    delete process.env.CLIENT_SECRET;

    await expect(configurePageIds(["page1", "page2"])).rejects.toThrow(
      "Missing required environment variables: PREFETCH_IO_URL, CLIENT_ID, CLIENT_SECRET"
    );

    expect(fetch).not.toHaveBeenCalled();
  });
});
