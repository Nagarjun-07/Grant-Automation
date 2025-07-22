'use server';

/**
 * @fileOverview Analyzes market trends for bioreactor technology.
 *
 * - analyzeMarket - A function that handles the market analysis.
 * - MarketAnalysisInput - The input type for the analyzeMarket function.
 * - MarketAnalysisOutput - The return type for the analyzeMarket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketAnalysisInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;

const MarketAnalysisOutputSchema = z.object({
  analysis: z
    .string()
    .describe('A detailed market analysis including trends, competitors, and opportunities.'),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

export async function analyzeMarket(
  input: MarketAnalysisInput
): Promise<MarketAnalysisOutput> {
  return analyzeMarketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: {schema: MarketAnalysisInputSchema},
  output: {schema: MarketAnalysisOutputSchema},
  prompt: `You are an expert market analyst specializing in the biotech and life sciences sectors.

  Based on the following technical documentation for a bioreactor, provide a detailed market analysis.
  
  Your analysis should include:
  1.  **Target Market:** Identify the primary and secondary markets for this technology.
  2.  **Market Trends:** Discuss relevant industry trends (e.g., cell therapy, continuous bioprocessing, personalized medicine).
  3.  **Competitive Landscape:** Name key competitors and their flagship products. Analyze their strengths and weaknesses relative to the described technology.
  4.  **Market Opportunity & Size:** Estimate the potential market size and identify key growth drivers.
  5.  **Barriers to Entry:** What are the potential hurdles for market entry (e.g., regulatory, manufacturing, cost)?

  Technical Documentation: {{{technicalDocumentation}}}
  
  Provide a comprehensive, well-structured report.`,
});

const analyzeMarketFlow = ai.defineFlow(
  {
    name: 'analyzeMarketFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
