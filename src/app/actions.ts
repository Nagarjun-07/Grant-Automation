'use server';

import {
  summarizeTechnicalDocumentation,
} from '@/ai/flows/summarize-technical-documentation';
import {
  generateExperimentalValidation,
} from '@/ai/flows/generate-experimental-validation';
import {
  assessTRLLevel,
  type TRLAssessmentInput,
} from '@/ai/flows/assess-trl-level';
import {
  generateRandDRoadmap,
  type GenerateRandDRoadmapInput,
} from '@/ai/flows/generate-r-and-d-roadmap';
import { 
  generateGrantProposal, 
  type GenerateGrantProposalInput 
} from '@/ai/flows/generate-grant-proposal';
import { analyzeMarket as analyzeMarketFlow, type MarketAnalysisInput } from '@/ai/flows/analyze-market';
import { analyzeIp as analyzeIpFlow, type IpAnalysisInput } from '@/ai/flows/analyze-ip';
import { analyzeRegulatory as analyzeRegulatoryFlow, type RegulatoryAnalysisInput } from '@/ai/flows/analyze-regulatory';
import { extractTextFromDocument as extractTextFromDocumentFlow, type ExtractTextFromDocumentInput } from '@/ai/flows/extract-text-from-document';


export async function summarize(input: { documentText: string }) {
  try {
    return await summarizeTechnicalDocumentation(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function validate(input: { technicalDocumentation: string }) {
  try {
    return await generateExperimentalValidation(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function assessTrl(input: TRLAssessmentInput) {
  try {
    return await assessTRLLevel(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function generateRoadmap(input: GenerateRandDRoadmapInput) {
  try {
    return await generateRandDRoadmap(input);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function createGrantProposal(input: GenerateGrantProposalInput) {
    try {
        return await generateGrantProposal(input);
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function analyzeMarket(input: MarketAnalysisInput) {
    try {
        return await analyzeMarketFlow(input);
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function analyzeIp(input: IpAnalysisInput) {
    try {
        return await analyzeIpFlow(input);
    } catch(e) {
        console.error(e);
        return null;
    }
}

export async function analyzeRegulatory(input: RegulatoryAnalysisInput) {
    try {
        return await analyzeRegulatoryFlow(input);
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
