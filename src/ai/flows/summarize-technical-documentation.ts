'use server';

/**
 * @fileOverview Summarizes technical documentation about a bioreactor.
 *
 * - summarizeTechnicalDocumentation - A function that summarizes the technical documentation.
 * - SummarizeTechnicalDocumentationInput - The input type for the summarizeTechnicalDocumentation function.
 * - SummarizeTechnicalDocumentationOutput - The return type for the summarizeTechnicalDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTechnicalDocumentationInputSchema = z.object({
  documentText: z.string().describe('The technical documentation text to summarize.'),
});
export type SummarizeTechnicalDocumentationInput = z.infer<typeof SummarizeTechnicalDocumentationInputSchema>;

const SummarizeTechnicalDocumentationOutputSchema = z.object({
  summary: z.string().describe('A concise summary briefing of the technical documentation.'),
});
export type SummarizeTechnicalDocumentationOutput = z.infer<typeof SummarizeTechnicalDocumentationOutputSchema>;

export async function summarizeTechnicalDocumentation(
  input: SummarizeTechnicalDocumentationInput
): Promise<SummarizeTechnicalDocumentationOutput> {
  return summarizeTechnicalDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTechnicalDocumentationPrompt',
  input: {schema: SummarizeTechnicalDocumentationInputSchema},
  output: {schema: SummarizeTechnicalDocumentationOutputSchema},
  prompt: `You are an expert in bioreactor technology. Please provide a concise summary briefing of the following technical documentation:\n\n{{{documentText}}}`,
});

const summarizeTechnicalDocumentationFlow = ai.defineFlow(
  {
    name: 'summarizeTechnicalDocumentationFlow',
    inputSchema: SummarizeTechnicalDocumentationInputSchema,
    outputSchema: SummarizeTechnicalDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
