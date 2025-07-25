'use server';

/**
 * @fileOverview Extracts grant details from a given text.
 *
 * - extractGrantDetails - A function that handles the grant detail extraction.
 * - ExtractGrantDetailsInput - The input type for the extractGrantDetails function.
 * - ExtractGrantDetailsOutput - The return type for the extractGrantDetails function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractGrantDetailsInputSchema = z.object({
  documentText: z.string().describe('The text to extract grant details from.'),
});
export type ExtractGrantDetailsInput = z.infer<typeof ExtractGrantDetailsInputSchema>;

const ExtractGrantDetailsOutputSchema = z.object({
    fundingSource: z.string().optional().describe('The source of the grant funding (e.g., "National Science Foundation").'),
    grantId: z.string().optional().describe('The unique identifier for the grant (e.g., "NSF-12345").'),
    fundingAmount: z.number().optional().describe('The total amount of the grant funding (e.g., 500000).'),
    duration: z.string().optional().describe('The duration of the grant (e.g., "2 years").'),
    associatedInstitutions: z.array(z.string()).optional().describe('A list of institutions associated with the grant.'),
});
export type ExtractGrantDetailsOutput = z.infer<typeof ExtractGrantDetailsOutputSchema>;

export async function extractGrantDetails(
  input: ExtractGrantDetailsInput
): Promise<ExtractGrantDetailsOutput> {
  return extractGrantDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractGrantDetailsPrompt',
  input: {schema: ExtractGrantDetailsInputSchema},
  output: {schema: ExtractGrantDetailsOutputSchema},
  prompt: `You are an expert at extracting grant information from documents. Analyze the following text and extract the following details:

  - Funding Source
  - Grant ID
  - Funding Amount
  - Duration
  - Associated Institutions

  If any of these details are not present in the text, leave the corresponding field in the output empty.

  Text: {{{documentText}}}

  Return the result as a valid JSON object.
  `,
});

const extractGrantDetailsFlow = ai.defineFlow(
  {
    name: 'extractGrantDetailsFlow',
    inputSchema: ExtractGrantDetailsInputSchema,
    outputSchema: ExtractGrantDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
