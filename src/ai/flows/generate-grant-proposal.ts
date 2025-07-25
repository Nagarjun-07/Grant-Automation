
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
  projectSummary: z.string().describe('A summary of the project.'),
});
export type GenerateGrantProposalInput = z.infer<typeof GenerateGrantProposalInputSchema>;

const GenerateGrantProposalOutputSchema = z.object({
  title: z.string().describe('A compelling title for the grant proposal.'),
  introduction: z.string().describe('A detailed introduction section.'),
  objectives: z.string().describe('A list of clear and measurable objectives.'),
  methodology: z.string().describe('A description of the project methodology.'),
  budget: z.string().describe('A summary of the project budget.'),
  conclusion: z.string().describe('A concluding summary of the proposal.'),
});
export type GenerateGrantProposalOutput = z.infer<typeof GenerateGrantProposalOutputSchema>;

export async function generateGrantProposal(input: GenerateGrantProposalInput): Promise<GenerateGrantProposalOutput> {
  return generateGrantProposalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGrantProposalPrompt',
  input: {schema: GenerateGrantProposalInputSchema},
  output: {schema: GenerateGrantProposalOutputSchema},
  prompt: `You are an expert grant writer. Based on the provided project summary, generate a complete and formal grant proposal.
The entire proposal must be written in professional, formal language suitable for a submission.

Project Summary: {{{projectSummary}}}

Generate a structured response with the following sections:
- title: A compelling title for the grant proposal.
- introduction: A detailed introduction section.
- objectives: A list of clear and measurable objectives.
- methodology: A description of the project methodology.
- budget: A summary of the project budget.
- conclusion: A concluding summary of the proposal.`,
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
