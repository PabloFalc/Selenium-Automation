import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  USER_SAUCE: z.string(),
  PASSWORD_SAUCE: z.string(),
});

export const env = envSchema
  .transform((data) => ({
    USER: data.USER_SAUCE,
    PASSWORD: data.PASSWORD_SAUCE,
  }))
  .parse(process.env);
