'use server';

/**
 * @fileOverview Generates experimental validations and identifies potential risks in bioreactor technical documentation.
 *
 * - getValidationAndRisks - A function that handles the generation of experimental validations and risk identification.
 * - ValidationAndRisksInput - The input type for the getValidationAndRisks function.
 * - ValidationAndRisksOutput - The return type for the getValidationAndRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidationAndRisksInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor.'),
});
export type ValidationAndRisksInput = z.infer<
  typeof ValidationAndRisksInputSchema
>;

const ValidationAndRisksOutputSchema = z.object({
  experimental_suggestions: z
    .array(z.string())
    .describe('Suggested experimental validations for the bioreactor.'),
  risk_list: z
    .array(z.string())
    .describe('Potential risks identified in the technical documentation.'),
});
export type ValidationAndRisksOutput = z.infer<
  typeof ValidationAndRisksOutputSchema
>;

export async function getValidationAndRisks(
  input: ValidationAndRisksInput
): Promise<ValidationAndRisksOutput> {
  return getValidationAndRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validationAndRisksPrompt',
  input: {schema: ValidationAndRisksInputSchema},
  output: {schema: ValidationAndRisksOutputSchema},
  prompt: `You are an expert in bioreactor technology and experimental validation.

  Based on the following technical documentation, suggest experimental validations and identify potential risks.

  Technical Documentation: {{{technicalDocumentation}}}

  Return a JSON object with two keys: "experimental_suggestions" (a list of strings) and "risk_list" (a list of strings).`,
});

const getValidationAndRisksFlow = ai.defineFlow(
  {
    name: 'getValidationAndRisksFlow',
    inputSchema: ValidationAndRisksInputSchema,
    outputSchema: ValidationAndRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
