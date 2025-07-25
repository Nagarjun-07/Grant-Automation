'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateProjectSummaryOutputSchema = z.object({
  projectSummary: z.string().describe('A summary of a project.'),
});
export type GenerateProjectSummaryOutput = z.infer<typeof GenerateProjectSummaryOutputSchema>;

export async function generateProjectSummary(): Promise<GenerateProjectSummaryOutput> {
  return generateProjectSummaryFlow();
}

const prompt = ai.definePrompt({
  name: 'generateProjectSummaryPrompt',
  output: {schema: GenerateProjectSummaryOutputSchema},
  prompt: `You are an expert at generating project summaries for grant applications. Generate a project summary for a project that is developing a new type of bioreactor for producing sustainable biofuels. The project is at the prototype stage and is seeking funding for further development and testing. The summary should be concise and highlight the key innovations and potential impact of the project.`,
});

const generateProjectSummaryFlow = ai.defineFlow(
  {
    name: 'generateProjectSummaryFlow',
    outputSchema: GenerateProjectSummaryOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
