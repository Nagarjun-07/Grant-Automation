'use server';

/**
 * @fileOverview Searches for public grants based on provided text.
 *
 * - searchGrants - A function that handles the grant search.
 * - SearchGrantsInput - The input type for the searchGrants function.
 * - SearchGrantsOutput - The return type for the searchGrants function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchGrantsInputSchema = z.object({
  projectSummary: z.string().describe('A summary of the project to find grants for.'),
});
export type SearchGrantsInput = z.infer<typeof SearchGrantsInputSchema>;

const SearchGrantsOutputSchema = z.array(
    z.object({
        title: z.string().describe('The title of the grant.'),
        url: z.string().url().describe('The URL to the grant details page.'),
        funding: z.string().describe('The funding amount or range.'),
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
  prompt: `You are an expert grant search consultant. Find 3-5 relevant public grants from government databases (like grants.gov) based on the following project summary: {{{projectSummary}}}.
  
  For each grant, provide the title, a URL, and the funding amount.
  
  Return the result as a valid JSON array of objects. If no grants are found, return an empty array.
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
