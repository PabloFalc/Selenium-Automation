import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  SAUCE_USER: z.string().optional(),
  SAUCE_PASSWORD: z.string().optional(),
  USER: z.string().optional(),
  PASSWORD: z.string().optional(),
});

export const env = envSchema
  .transform((values) => ({
    USER: values.SAUCE_USER ?? values.USER,
    PASSWORD: values.SAUCE_PASSWORD ?? values.PASSWORD,
  }))
  .pipe(
    z.object({
      USER: z.string().min(1),
      PASSWORD: z.string().min(1),
    }),
  )
  .parse(process.env);
