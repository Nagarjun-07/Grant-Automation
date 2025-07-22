'use server';
/**
 * @fileOverview Generates an R&D roadmap for the bioreactor system, outlining key phases from lab to deployment.
 *
 * - getRandDPipeline - A function that handles the R&D roadmap generation process.
 * - RandDPipelineInput - The input type for the getRandDPipeline function.
 * - RandDPipelineOutput - The return type for the getRandDPipeline function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RandDPipelineInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor system.'),
});
export type RandDPipelineInput = z.infer<typeof RandDPipelineInputSchema>;

const RandDPipelineOutputSchema = z.object({
  phases: z.array(z.object({
    phase: z.string().describe("Name of the R&D phase."),
    start_date: z.string().describe("Start date of the phase in YYYY-MM-DD format."),
    end_date: z.string().describe("End date of the phase in YYYY-MM-DD format."),
    description: z.string().describe("Description of the activities in this phase."),
  })).describe("The R&D roadmap phases.")
});
export type RandDPipelineOutput = z.infer<typeof RandDPipelineOutputSchema>;

export async function getRandDPipeline(input: RandDPipelineInput): Promise<RandDPipelineOutput> {
  return getRandDPipelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getRandDPipelinePrompt',
  input: {schema: RandDPipelineInputSchema},
  output: {schema: RandDPipelineOutputSchema},
  prompt: `You are an expert in bioreactor technology and R&D planning. Based on the technical documentation provided, create an R&D roadmap. 
  
  The roadmap should be a JSON object containing a "phases" array. Each object in the array should represent a key phase from lab to deployment and include "phase", "start_date", "end_date", and "description" fields. Be realistic with timelines.

Technical Documentation: {{{technicalDocumentation}}}
`,
});

const getRandDPipelineFlow = ai.defineFlow(
  {
    name: 'getRandDPipelineFlow',
    inputSchema: RandDPipelineInputSchema,
    outputSchema: RandDPipelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
