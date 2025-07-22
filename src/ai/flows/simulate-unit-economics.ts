'use server';

/**
 * @fileOverview Simulates unit economics based on scale parameters.
 *
 * - simulateUnitEconomics - A function that handles the unit economics simulation.
 * - SimulateUnitEconomicsInput - The input type for the function.
 * - SimulateUnitEconomicsOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateUnitEconomicsInputSchema = z.object({
  production_scale: z.number().describe('The production scale in units.'),
  cost_per_unit: z.number().describe('The cost per unit in dollars.'),
  revenue_per_unit: z.number().describe('The revenue per unit in dollars.'),
});
export type SimulateUnitEconomicsInput = z.infer<typeof SimulateUnitEconomicsInputSchema>;

const SimulateUnitEconomicsOutputSchema = z.object({
  unit_cost: z.number().describe('The cost per unit.'),
  roi: z.string().describe('The return on investment as a percentage (e.g., "50.00%").'),
  payback_period: z
    .string()
    .describe('The payback period in years (e.g., "2.00 years").'),
});
export type SimulateUnitEconomicsOutput = z.infer<typeof SimulateUnitEconomicsOutputSchema>;

export async function simulateUnitEconomics(
  input: SimulateUnitEconomicsInput
): Promise<SimulateUnitEconomicsOutput> {
  return simulateUnitEconomicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateUnitEconomicsPrompt',
  input: {schema: SimulateUnitEconomicsInputSchema},
  output: {schema: SimulateUnitEconomicsOutputSchema},
  prompt: `You are a financial analyst. Based on the provided scale parameters, calculate the unit cost, ROI, and payback period.

  - The unit cost is the same as the input cost_per_unit.
  - ROI should be calculated as ((Revenue - Cost) / Cost) * 100.
  - Assume the total investment is (cost_per_unit * production_scale).
  - Assume the annual return is ((revenue_per_unit - cost_per_unit) * production_scale).
  - The payback period should be Total Investment / Annual Return.

  Format the ROI as a percentage string with two decimal places (e.g., "50.00%").
  Format the payback period as a string with two decimal places followed by " years" (e.g., "2.00 years").

  Parameters:
  - Production Scale: {{{production_scale}}}
  - Cost Per Unit: {{{cost_per_unit}}}
  - Revenue Per Unit: {{{revenue_per_unit}}}

  Return ONLY the calculated JSON object.
  `,
});

const simulateUnitEconomicsFlow = ai.defineFlow(
  {
    name: 'simulateUnitEconomicsFlow',
    inputSchema: SimulateUnitEconomicsInputSchema,
    outputSchema: SimulateUnitEconomicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
