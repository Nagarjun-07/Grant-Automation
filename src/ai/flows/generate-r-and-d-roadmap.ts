'use server';
/**
 * @fileOverview Generates an R&D roadmap for the bioreactor system, outlining key phases from lab to deployment.
 *
 * - generateRandDRoadmap - A function that handles the R&D roadmap generation process.
 * - GenerateRandDRoadmapInput - The input type for the generateRandDRoadmap function.
 * - GenerateRandDRoadmapOutput - The return type for the generateRandDRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRandDRoadmapInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor system.'),
  productionScale: z.string().optional().describe('The production scale of the bioreactor system (e.g., lab scale, pilot scale, industrial scale).'),
  costPerUnit: z.string().optional().describe('The estimated cost per unit of production.'),
  revenuePerUnit: z.string().optional().describe('The estimated revenue per unit of production.'),
});
export type GenerateRandDRoadmapInput = z.infer<typeof GenerateRandDRoadmapInputSchema>;

const GenerateRandDRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('The R&D roadmap for the bioreactor system, outlining key phases from lab to deployment.'),
});
export type GenerateRandDRoadmapOutput = z.infer<typeof GenerateRandDRoadmapOutputSchema>;

export async function generateRandDRoadmap(input: GenerateRandDRoadmapInput): Promise<GenerateRandDRoadmapOutput> {
  return generateRandDRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRandDRoadmapPrompt',
  input: {schema: GenerateRandDRoadmapInputSchema},
  output: {schema: GenerateRandDRoadmapOutputSchema},
  prompt: `You are an expert in bioreactor technology and R&D planning. Based on the technical documentation provided, create an R&D roadmap outlining the key phases from lab to deployment. Consider the production scale, cost per unit, and revenue per unit if provided. Be very detailed in the roadmap.

Technical Documentation: {{{technicalDocumentation}}}
Production Scale: {{{productionScale}}}
Cost per Unit: {{{costPerUnit}}}
Revenue per Unit: {{{revenuePerUnit}}}

R&D Roadmap:`,
});

const generateRandDRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRandDRoadmapFlow',
    inputSchema: GenerateRandDRoadmapInputSchema,
    outputSchema: GenerateRandDRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
