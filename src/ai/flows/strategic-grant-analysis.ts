'use server';
/**
 * @fileOverview Analyzes technical documentation to provide strategic grant recommendations.
 *
 * - strategicGrantAnalysis - A function that performs the analysis.
 * - StrategicGrantAnalysisInput - The input type for the function.
 * - StrategicGrantAnalysisOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicGrantAnalysisInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('The full technical documentation for the project.'),
});
export type StrategicGrantAnalysisInput = z.infer<
  typeof StrategicGrantAnalysisInputSchema
>;

const StrategicGrantAnalysisOutputSchema = z.array(
  z.object({
    title: z.string().describe('The title of the grant opportunity.'),
    url: z.string().url().describe('The URL to the grant details page.'),
    funding: z.string().describe('The funding amount or range.'),
    purpose: z.string().describe('The main purpose or focus of the grant.'),
    eligibility: z.string().describe('Key eligibility requirements.'),
    fitReason: z
      .string()
      .describe(
        'A summary of why the project is a strong fit for this grant.'
      ),
    alignmentTips: z
      .string()
      .describe(
        'Actionable advice on how to align the proposal for maximum success.'
      ),
  })
);
export type StrategicGrantAnalysisOutput = z.infer<
  typeof StrategicGrantAnalysisOutputSchema
>;

export async function strategicGrantAnalysis(
  input: StrategicGrantAnalysisInput
): Promise<StrategicGrantAnalysisOutput> {
  return strategicGrantAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategicGrantAnalysisPrompt',
  input: {schema: StrategicGrantAnalysisInputSchema},
  output: {schema: StrategicGrantAnalysisOutputSchema},
  prompt: `You are an expert grant consultant with deep knowledge of global government and private funding opportunities. Your task is to analyze the provided technical documentation and recommend 2-3 highly relevant grants.

  1.  **Analyze the Document:** Carefully read the document and extract key information: the problem, the solution, innovation highlights, commercial potential, scalability, and impact (environmental, economic, etc.).
  2.  **Identify Grants:** Based on your analysis, find the most relevant grant opportunities. These can be government or private, local or international.
  3.  **Provide a Detailed Report:** For each grant, you must provide a detailed summary.

  Return a valid JSON array of objects. For each grant, include:
  -   **title:** The official title of the grant.
  -   **url:** A valid URL to the grant's page.
  -   **funding:** The total funding amount or range available.
  -   **purpose:** A concise summary of the grant's main funding purpose.
  -   **eligibility:** A summary of the key eligibility criteria.
  -   **fitReason:** A paragraph explaining *why* the project from the documentation is an excellent fit for this specific grant.
  -   **alignmentTips:** A paragraph providing actionable advice on how the proposal should be framed to maximize its chances of success with this funder.

  Technical Documentation:
  {{{technicalDocumentation}}}
  `,
});

const strategicGrantAnalysisFlow = ai.defineFlow(
  {
    name: 'strategicGrantAnalysisFlow',
    inputSchema: StrategicGrantAnalysisInputSchema,
    outputSchema: StrategicGrantAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
