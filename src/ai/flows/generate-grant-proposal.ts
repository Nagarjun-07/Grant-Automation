'use server';

/**
 * @fileOverview Grant proposal generator.
 *
 * - generateGrantProposal - A function that generates a tailored grant proposal.
 * - GenerateGrantProposalInput - The input type for the generateGrantProposal function.
 * - GenerateGrantProposalOutput - The return type for the generateGrantProposal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGrantProposalInputSchema = z.object({
  grantDetails: z
    .string()
    .describe('Details about the grant, including title and funding amount.'),
  pastProposals: z
    .string()
    .describe('Example of past successful grant proposals.'),
  projectSummary: z.string().describe('A summary of the project.'),
});
export type GenerateGrantProposalInput = z.infer<typeof GenerateGrantProposalInputSchema>;

const GenerateGrantProposalOutputSchema = z.object({
  proposal: z.string().describe('The generated grant proposal.'),
});
export type GenerateGrantProposalOutput = z.infer<typeof GenerateGrantProposalOutputSchema>;

export async function generateGrantProposal(input: GenerateGrantProposalInput): Promise<GenerateGrantProposalOutput> {
  return generateGrantProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGrantProposalPrompt',
  input: {schema: GenerateGrantProposalInputSchema},
  output: {schema: GenerateGrantProposalOutputSchema},
  prompt: `You are an expert grant writer. Use the following information to generate a tailored grant proposal.

Grant Details: {{{grantDetails}}}

Past Proposals: {{{pastProposals}}}

Project Summary: {{{projectSummary}}}

Include the following sections in the proposal:
- Title
- Introduction
- Objectives
- Methodology
- Budget
- Conclusion`,
});

const generateGrantProposalFlow = ai.defineFlow(
  {
    name: 'generateGrantProposalFlow',
    inputSchema: GenerateGrantProposalInputSchema,
    outputSchema: GenerateGrantProposalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
