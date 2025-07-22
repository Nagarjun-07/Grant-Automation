import { config } from 'dotenv';
config();

import '@/ai/flows/generate-r-and-d-roadmap.ts';
import '@/ai/flows/assess-trl-level.ts';
import '@/ai/flows/generate-grant-proposal.ts';
import '@/ai/flows/generate-experimental-validation.ts';
import '@/ai/flows/summarize-technical-documentation.ts';