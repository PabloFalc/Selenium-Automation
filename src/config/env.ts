import { config } from "dotenv";
import { z } from "zod";

config();

const envShchema = z.object({
  USER: z.string(),
  PASSWORD: z.string(),
});

export const env = envShchema.parse(process.env);
