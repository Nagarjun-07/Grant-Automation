'use server';

/**
 * @fileOverview Analyzes intellectual property landscape for bioreactor technology.
 *
 * - analyzeIp - A function that handles the IP analysis.
 * - IpAnalysisInput - The input type for the analyzeIp function.
 * - IpAnalysisOutput - The return type for the analyzeIp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IpAnalysisInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor.'),
});
export type IpAnalysisInput = z.infer<typeof IpAnalysisInputSchema>;

const IpAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A detailed analysis of potential patentable ideas and IP strategy.'),
});
export type IpAnalysisOutput = z.infer<typeof IpAnalysisOutputSchema>;

export async function analyzeIp(
  input: IpAnalysisInput
): Promise<IpAnalysisOutput> {
  return analyzeIpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ipAnalysisPrompt',
  input: {schema: IpAnalysisInputSchema},
  output: {schema: IpAnalysisOutputSchema},
  prompt: `You are a patent agent with expertise in mechanical engineering and biotechnology.

  Review the following technical documentation for a bioreactor and provide an intellectual property (IP) analysis.
  
  Your analysis must cover:
  1.  **Potentially Patentable Inventions:** Identify specific components, processes, or features described in the document that appear to be novel and non-obvious. For each, briefly explain the potential invention.
  2.  **Freedom to Operate (FTO) Considerations:** Highlight areas where there might be a risk of infringing on existing patents. Suggest keywords and concepts for a preliminary patent search. (Disclaimer: this is not a formal FTO analysis).
  3.  **IP Strategy Suggestions:** Recommend a potential IP strategy. Should the focus be on utility patents, design patents, or trade secrets? Suggest a high-level roadmap for protecting the identified inventions.

  Technical Documentation: {{{technicalDocumentation}}}
  
  Structure your output clearly with the headings "Patentable Inventions", "Freedom to Operate Considerations", and "IP Strategy Suggestions".`,
});

const analyzeIpFlow = ai.defineFlow(
  {
    name: 'analyzeIpFlow',
    inputSchema: IpAnalysisInputSchema,
    outputSchema: IpAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
