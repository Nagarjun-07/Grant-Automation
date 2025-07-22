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
  prompt: `You are a TRL assessment expert. Analyze the technical content and assign a TRL (1-9) to each mentioned component (e.g., sensor, control system, pump, valve, bioreactor, reactor). 
  
  Return ONLY a valid JSON object mapping components to their TRL levels, justifications, and a 'timestamp' field.

  Example Output Format:
  {
    "sensor": {"trl": 4, "justification": "Lab validated", "timestamp": "2025-07-22 13:34:00 IST"},
    "pump": {"trl": 3, "justification": "Proof of concept", "timestamp": "2025-07-22 13:34:00 IST"}
  }

  Technical Documentation:
  {{{technicalDocumentation}}}
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
