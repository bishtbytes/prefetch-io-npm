export async function configurePageIds(validPageIds: string[]) {
  const requiredEnvVars = {
    PREFETCH_IO_URL: process.env.PREFETCH_IO_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }

  console.log(JSON.stringify(validPageIds, null, 2));
  const serverHost = process.env.PREFETCH_IO_URL;
  const endpoint = `${serverHost}/api/v1/configure`;
  const payload = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    rateLimitWindow: 60,
    useAccessToken: true,
    accessTokenValidity: 3600,
    rateLimitPerEntityId: 1,
    validPageIds,
    validActionIds: ["pageviews"],
  };

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      referer: process.env.SITE_ADDRESS || "",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Updated configuration:", data);
      return data; // Optional: return data for further use
    })
    .catch((error) => {
      console.error("Error occurred:", error);
      throw error; // Re-throw to propagate the error
    });
}
