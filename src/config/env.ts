import "dotenv";
import { z } from "zod";

const envShchema = z.object({
  user: z.email({ error: "Utilize um email valido" }),
  password: z.string().length(12),
});

export const env = envShchema.parse(process.env);
