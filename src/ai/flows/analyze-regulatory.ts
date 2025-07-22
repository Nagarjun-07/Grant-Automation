'use server';

/**
 * @fileOverview Analyzes the potential regulatory pathway for a bioreactor.
 *
 * - analyzeRegulatory - A function that handles the regulatory pathway analysis.
 * - RegulatoryAnalysisInput - The input type for the analyzeRegulatory function.
 * - RegulatoryAnalysisOutput - The return type for the analyzeRegulatory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegulatoryAnalysisInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor.'),
});
export type RegulatoryAnalysisInput = z.infer<typeof RegulatoryAnalysisInputSchema>;

const RegulatoryAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A detailed analysis of the potential regulatory pathway.'),
});
export type RegulatoryAnalysisOutput = z.infer<typeof RegulatoryAnalysisOutputSchema>;

export async function analyzeRegulatory(
  input: RegulatoryAnalysisInput
): Promise<RegulatoryAnalysisOutput> {
  return analyzeRegulatoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regulatoryAnalysisPrompt',
  input: {schema: RegulatoryAnalysisInputSchema},
  output: {schema: RegulatoryAnalysisOutputSchema},
  prompt: `You are a regulatory affairs consultant specializing in medical devices and bioprocessing equipment for the US (FDA) and European (EMA) markets.

  Based on the technical documentation provided for this bioreactor, outline a potential regulatory pathway.
  
  Your analysis should include:
  1.  **Device/Equipment Classification:** Propose a likely classification in both the US (e.g., Class I, II, III device) and EU (e.g., MDD/MDR class, or not a medical device). Justify your reasoning.
  2.  **Likely Regulatory Submissions:** Identify the types of submissions that would be required (e.g., 510(k), PMA, CE marking technical file).
  3.  **Key Standards and Guidance:** List critical standards (e.g., ISO 13485, ISO 10993) and FDA/EMA guidance documents that would likely apply to the development and manufacturing of this system.
  4.  **Major Regulatory Hurdles:** What are the most significant challenges and risks from a regulatory perspective that the developers should anticipate?

  Technical Documentation: {{{technicalDocumentation}}}
  
  Provide a clear, actionable summary for a team unfamiliar with regulatory affairs.`,
});

const analyzeRegulatoryFlow = ai.defineFlow(
  {
    name: 'analyzeRegulatoryFlow',
    inputSchema: RegulatoryAnalysisInputSchema,
    outputSchema: RegulatoryAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
