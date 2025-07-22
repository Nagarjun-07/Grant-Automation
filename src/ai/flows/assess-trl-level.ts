// Assess the Technology Readiness Level (TRL) of bioreactor components.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TRLAssessmentInputSchema = z.object({
  componentDescription: z
    .string()
    .describe('Description of the bioreactor component.'),
  technicalData: z
    .string()
    .describe('Technical data related to the bioreactor component.'),
});
export type TRLAssessmentInput = z.infer<typeof TRLAssessmentInputSchema>;

const TRLAssessmentOutputSchema = z.object({
  trlLevel: z.number().describe('The assessed Technology Readiness Level (TRL) of the component (1-9).'),
  justification: z.string().describe('Justification for the TRL assessment.'),
  assessmentTimestamp: z.string().describe('Timestamp of the TRL assessment (ISO format).'),
});
export type TRLAssessmentOutput = z.infer<typeof TRLAssessmentOutputSchema>;

export async function assessTRLLevel(input: TRLAssessmentInput): Promise<TRLAssessmentOutput> {
  return assessTRLLevelFlow(input);
}

const assessTRLLevelPrompt = ai.definePrompt({
  name: 'assessTRLLevelPrompt',
  input: {schema: TRLAssessmentInputSchema},
  output: {schema: TRLAssessmentOutputSchema},
  prompt: `You are an expert in assessing the Technology Readiness Level (TRL) of bioreactor components.

  Based on the provided component description and technical data, determine the TRL level (1-9), provide a justification for your assessment, and include a timestamp.

  Component Description: {{{componentDescription}}}
  Technical Data: {{{technicalData}}}
  
  Ensure the assessmentTimestamp is in ISO format.
  `,
});

const assessTRLLevelFlow = ai.defineFlow(
  {
    name: 'assessTRLLevelFlow',
    inputSchema: TRLAssessmentInputSchema,
    outputSchema: TRLAssessmentOutputSchema,
  },
  async input => {
    const {output} = await assessTRLLevelPrompt(input);
    return output!;
  }
);
