import Primisc from "@prismicio/client";

export function getPrismicClient(req?: unknown) {
  const prismic = Primisc.client(process.env.PRISMIC_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
