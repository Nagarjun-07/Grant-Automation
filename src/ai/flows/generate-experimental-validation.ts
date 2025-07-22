'use server';

/**
 * @fileOverview Generates experimental validations and identifies potential risks in bioreactor technical documentation.
 *
 * - generateExperimentalValidation - A function that handles the generation of experimental validations and risk identification.
 * - ExperimentalValidationInput - The input type for the generateExperimentalValidation function.
 * - ExperimentalValidationOutput - The return type for the generateExperimentalValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExperimentalValidationInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor.'),
});
export type ExperimentalValidationInput = z.infer<
  typeof ExperimentalValidationInputSchema
>;

const ExperimentalValidationOutputSchema = z.object({
  validationSuggestions: z
    .string()
    .describe('Suggested experimental validations for the bioreactor.'),
  riskAnalysis: z
    .string()
    .describe('Potential risks identified in the technical documentation.'),
});
export type ExperimentalValidationOutput = z.infer<
  typeof ExperimentalValidationOutputSchema
>;

export async function generateExperimentalValidation(
  input: ExperimentalValidationInput
): Promise<ExperimentalValidationOutput> {
  return generateExperimentalValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'experimentalValidationPrompt',
  input: {schema: ExperimentalValidationInputSchema},
  output: {schema: ExperimentalValidationOutputSchema},
  prompt: `You are an expert in bioreactor technology and experimental validation.

  Based on the following technical documentation, suggest experimental validations and identify potential risks.

  Technical Documentation: {{{technicalDocumentation}}}

  Validation Suggestions: [suggestions]
  Risk Analysis: [risks]`,
});

const generateExperimentalValidationFlow = ai.defineFlow(
  {
    name: 'generateExperimentalValidationFlow',
    inputSchema: ExperimentalValidationInputSchema,
    outputSchema: ExperimentalValidationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
