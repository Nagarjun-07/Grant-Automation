'use server';

/**
 * @fileOverview Searches for public grants.
 *
 * - searchGrants - A function that handles the grant search.
 * - SearchGrantsInput - The input type for the searchGrants function.
 * - SearchGrantsOutput - The return type for the searchGrants function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchGrantsInputSchema = z.object({
  keywords: z.array(z.string()).describe('Keywords to search for grants.'),
});
export type SearchGrantsInput = z.infer<typeof SearchGrantsInputSchema>;

const SearchGrantsOutputSchema = z.array(
    z.object({
        title: z.string().describe('The title of the grant.'),
        url: z.string().url().describe('The URL to the grant details page.'),
        funding: z.string().describe('The funding amount or range.'),
        agency: z.string().describe('The agency providing the grant.'),
        deadline: z.string().describe('The application deadline in YYYY-MM-DD format.'),
    })
);
export type SearchGrantsOutput = z.infer<typeof SearchGrantsOutputSchema>;

export async function searchGrants(
  input: SearchGrantsInput
): Promise<SearchGrantsOutput> {
  return searchGrantsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchGrantsPrompt',
  input: {schema: SearchGrantsInputSchema},
  output: {schema: SearchGrantsOutputSchema},
  prompt: `You are a grant search expert. Find 3-5 relevant public grants from government databases (like grants.gov) based on the following keywords.
  
  For each grant, provide the title, a URL, the funding amount, the responsible agency, and the deadline.
  
  Keywords: {{{keywords}}}
  
  Return the result as a valid JSON array of objects.
  `,
});

const searchGrantsFlow = ai.defineFlow(
  {
    name: 'searchGrantsFlow',
    inputSchema: SearchGrantsInputSchema,
    outputSchema: SearchGrantsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
