import { Langfuse } from "langfuse";

let _langfuse: Langfuse | null = null;

export function getLangfuse(): Langfuse {
  if (!_langfuse) {
    _langfuse = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl:
        process.env.LANGFUSE_BASE_URL ||
        process.env.LANGFUSE_HOST ||
        "https://us.cloud.langfuse.com",
    });
  }
  return _langfuse;
}
