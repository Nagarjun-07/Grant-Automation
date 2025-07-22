'use server';

/**
 * @fileOverview Assess the Technology Readiness Level (TRL) of bioreactor components.
 * - getTRLBreakdown - A function that handles the TRL breakdown.
 * - TRLBreakdownInput - The input type for the getTRLBreakdown function.
 * - TRLBreakdownOutput - The return type for the getTRLBreakdown function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TRLBreakdownInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor system.'),
});
export type TRLBreakdownInput = z.infer<typeof TRLBreakdownInputSchema>;

const TRLBreakdownOutputSchema = z.record(
    z.string().describe("The name of the component being assessed."),
    z.object({
        trl: z.number().describe('The assessed Technology Readiness Level (TRL) of the component (1-9).'),
        justification: z.string().describe('Justification for the TRL assessment.'),
        timestamp: z.string().describe('Timestamp of the TRL assessment (e.g., "2025-07-22 13:34:00 IST").'),
    })
);
export type TRLBreakdownOutput = z.infer<typeof TRLBreakdownOutputSchema>;

export async function getTRLBreakdown(input: TRLBreakdownInput): Promise<TRLBreakdownOutput> {
  return getTRLBreakdownFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getTRLBreakdownPrompt',
  input: {schema: TRLBreakdownInputSchema},
  output: {schema: TRLBreakdownOutputSchema},
  prompt: `You are an expert in assessing the Technology Readiness Level (TRL) of bioreactor components.

  Based on the provided technical documentation, identify the key components of the bioreactor system. For each component, determine the TRL level (1-9), provide a justification for your assessment, and include a timestamp in 'YYYY-MM-DD HH:MM:SS Z' format.

  Return ONLY a valid JSON object where each key is a component name and the value is an object containing the TRL, justification, and timestamp. Do not include any other text or formatting.

  Example Output:
  {
    "sensor": {"trl": 4, "justification": "Lab validated", "timestamp": "2025-07-22 13:34:00 IST"},
    "pump": {"trl": 3, "justification": "Proof of concept", "timestamp": "2025-07-22 13:34:00 IST"}
  }

  Technical Documentation: {{{technicalDocumentation}}}
  `,
});

const getTRLBreakdownFlow = ai.defineFlow(
  {
    name: 'getTRLBreakdownFlow',
    inputSchema: TRLBreakdownInputSchema,
    outputSchema: TRLBreakdownOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
