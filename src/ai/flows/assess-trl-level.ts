'use server';

/**
 * @fileOverview Assess the Technology Readiness Level (TRL) of bioreactor components.
 * - getTRLBreakdown - A function that handles the TRL breakdown.
 * - TRLBreakdownInput - The input type for the getTRLBreakdown function.
 * - TRLBreakdownOutput - The return type for the getTRLBreakdown function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

// This schema defines what the AI is expected to return.
const AIOutputSchema = z.record(
    z.string(),
    z.object({
        trl: z.number(),
        justification: z.string(),
    })
);

const getTRLBreakdownFlow = ai.defineFlow(
  {
    name: 'getTRLBreakdownFlow',
    inputSchema: TRLBreakdownInputSchema,
    outputSchema: TRLBreakdownOutputSchema,
  },
  async ({ technicalDocumentation }) => {
    // 1. Identify components first, using a regex.
    const componentRegex = /(bioreactor|reactor|sensor|control system|pump|valve)/gi;
    const foundComponents = [...new Set(technicalDocumentation.match(componentRegex)?.map(c => c.toLowerCase()) || [])];

    // If no components are found, return an empty object immediately.
    if (foundComponents.length === 0) {
      return {};
    }

    // 2. Build the prompt and call the AI.
    const prompt = `You are a TRL assessment expert. Analyze the technical documentation provided and assign a TRL (1-9) to each of the following components: ${foundComponents.join(', ')}. 
  
Return ONLY a valid JSON object mapping the components you were asked to assess to their TRL levels and justifications. Do not assess any other components.

Example Output Format:
{
  "sensor": {"trl": 4, "justification": "Lab validated"},
  "pump": {"trl": 3, "justification": "Proof of concept"}
}

Technical Documentation:
${technicalDocumentation}`;

    const { text } = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      config: {
        temperature: 0.2, // Lower temperature for more predictable JSON output
      }
    });

    let aiOutput: z.infer<typeof AIOutputSchema> = {};
    try {
        aiOutput = JSON.parse(text);
    } catch(e) {
        console.error("Failed to parse AI response as JSON", text);
        // If parsing fails, aiOutput remains an empty object, and the fallback logic will handle it.
    }

    const finalOutput: TRLBreakdownOutput = {};
    const currentTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).replace(/,/, '') + ' IST';
    
    // 3. Validate and enhance the AI's response (This is the crucial step).
    for (const component of foundComponents) {
        const assessment = aiOutput?.[component];

        // Check if the AI returned a valid assessment for the component.
        if (assessment && typeof assessment.trl === 'number' && assessment.trl >= 1 && assessment.trl <= 9 && assessment.justification) {
            // If valid, add it to our final output with the current timestamp.
            finalOutput[component] = {
                ...assessment,
                timestamp: currentTime,
            };
        } else {
            // If the AI failed for a component or the TRL is invalid, add a default value.
            // This ensures we ALWAYS return a result for every component we found.
            finalOutput[component] = {
                trl: 1,
                justification: "No specific data found, defaulting to theoretical stage.",
                timestamp: currentTime,
            };
        }
    }
    
    return finalOutput;
  }
);
