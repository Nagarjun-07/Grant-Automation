'use server';
import {
  summarizeTechnicalDocumentation,
} from '@/ai/flows/summarize-technical-documentation';
import {
  getValidationAndRisks,
  type ValidationAndRisksInput,
  type ValidationAndRisksOutput,
} from '@/ai/flows/generate-experimental-validation';
import {
  getTRLBreakdown,
  type TRLBreakdownInput,
  type TRLBreakdownOutput,
} from '@/ai/flows/assess-trl-level';
import {
  getRandDPipeline,
  type RandDPipelineInput,
  type RandDPipelineOutput,
} from '@/ai/flows/generate-r-and-d-roadmap';
import { 
  generateGrantProposal, 
  type GenerateGrantProposalInput,
  type GenerateGrantProposalOutput
} from '@/ai/flows/generate-grant-proposal';
import {
  extractGrantDetails as extractGrantDetailsFlow,
  type ExtractGrantDetailsInput,
  type ExtractGrantDetailsOutput,
} from '@/ai/flows/extract-grant-details';
import {
  generateProjectSummary as generateProjectSummaryFlow,
} from '@/ai/flows/generate-project-summary';
import {
  simulateUnitEconomics,
  type SimulateUnitEconomicsInput,
  type SimulateUnitEconomicsOutput,
} from '@/ai/flows/simulate-unit-economics';
import { extractTextFromDocument as extractTextFromDocumentFlow, type ExtractTextFromDocumentInput } from '@/ai/flows/extract-text-from-document';

export async function summarize(input: { documentText: string }) {
  try {
    return await summarizeTechnicalDocumentation(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function validationAndRisks(input: ValidationAndRisksInput): Promise<ValidationAndRisksOutput | null> {
  try {
    return await getValidationAndRisks(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function trlBreakdown(input: TRLBreakdownInput): Promise<TRLBreakdownOutput | null> {
  try {
    return await getTRLBreakdown(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function randDPipeline(input: RandDPipelineInput): Promise<RandDPipelineOutput | null> {
  try {
    return await getRandDPipeline(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function createGrantProposal(input: GenerateGrantProposalInput): Promise<GenerateGrantProposalOutput | null> {
    try {
        return await generateGrantProposal(input);
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function generateProjectSummary() {
    try {
        return await generateProjectSummaryFlow();
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function extractGrantDetails(input: ExtractGrantDetailsInput): Promise<ExtractGrantDetailsOutput | null> {
    try {
        return await extractGrantDetailsFlow(input);
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function runUnitEconomics(input: SimulateUnitEconomicsInput): Promise<SimulateUnitEconomicsOutput | null> {
    try {
        return await simulateUnitEconomics(input);
    } catch(e) {
        console.error(e);
        return null;
    }
}


export async function extractText(input: ExtractTextFromDocumentInput) {
  try {
    return await extractTextFromDocumentFlow(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}
