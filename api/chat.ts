import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleChatRequest } from "../chatHandler";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { messages } = req.body ?? {};
  const result = await handleChatRequest(messages);
  res.status(result.status).json(result.body);
}
