'use server';

/**
 * Assess the Technology Readiness Level (TRL) of bioreactor components.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TRLBreakdownInputSchema = z.object({
  technicalDocumentation: z
    .string()
    .describe('Technical documentation of the bioreactor system.'),
});
export type TRLBreakdownInput = z.infer<typeof TRLBreakdownInputSchema>;

const TRLBreakdownOutputSchema = z.record(
  z.string().describe("The name of the component being assessed."),
  z.object({
    trl: z.number().describe('The assessed Technology Readiness Level (TRL) of the component (1-9).'),
    justification: z.string().describe('Justification for the TRL assessment.'),
    timestamp: z.string().describe('Timestamp of the TRL assessment (e.g., "2025-07-22 13:34:00 IST").'),
  })
);
export type TRLBreakdownOutput = z.infer<typeof TRLBreakdownOutputSchema>;

export async function getTRLBreakdown(input: TRLBreakdownInput): Promise<TRLBreakdownOutput> {
  return getTRLBreakdownFlow(input);
}

const getTRLBreakdownFlow = ai.defineFlow(
  {
    name: 'getTRLBreakdownFlow',
    inputSchema: TRLBreakdownInputSchema,
    outputSchema: TRLBreakdownOutputSchema,
  },
  async ({ technicalDocumentation }) => {
    const componentRegex = /(bioreactor|reactor|sensor|control system|pump|valve)/gi;
    const foundComponents = [...new Set(technicalDocumentation.match(componentRegex)?.map(c => c.toLowerCase()) || [])];

    if (foundComponents.length === 0) return {};

    const trl_patterns = {
      "TRL 1": /basic principles|initial concept|theoretical/i,
      "TRL 2": /formulation|conceptual design|application/i,
      "TRL 3": /proof of concept|experimental|prototype/i,
      "TRL 4": /lab validation|small-scale testing/i,
      "TRL 5": /large-scale testing|integrated prototype/i,
      "TRL 6": /demonstrated in relevant environment/i,
      "TRL 7": /system prototype|operational environment/i,
      "TRL 8": /system complete|qualified/i,
      "TRL 9": /fully operational|deployed/i,
    };

    const finalOutput: TRLBreakdownOutput = {};
    const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).replace(/,/, '') + ' IST';

    for (const component of foundComponents) {
      const componentText = technicalDocumentation.match(new RegExp(`.{0,200}${component}.{0,200}`, 'gi'))?.join(' ') || '';
      let assignedTRL = 1;
      let justification = 'No specific data found, defaulting to theoretical stage.';

      for (const [trl, pattern] of Object.entries(trl_patterns)) {
        if (pattern.test(componentText)) {
          assignedTRL = parseInt(trl.split(' ')[1]);
          justification = `Matched pattern: ${trl}`;
          break;
        }
      }

      finalOutput[component] = {
        trl: assignedTRL,
        justification,
        timestamp: currentTime,
      };
    }

    return finalOutput;
  }
);
