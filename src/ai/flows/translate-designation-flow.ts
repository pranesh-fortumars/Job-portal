'use server';
/**
 * @fileOverview A translation agent for job designations.
 * 
 * - translateDesignation - Handles auto-translation of designation names for the industrial registry.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateDesignationInputSchema = z.object({
  name: z.string().describe('The designation name in English.'),
});
export type TranslateDesignationInput = z.infer<typeof TranslateDesignationInputSchema>;

const TranslateDesignationOutputSchema = z.object({
  tamil: z.string().describe('The Tamil translation.'),
  hindi: z.string().describe('The Hindi translation.'),
});
export type TranslateDesignationOutput = z.infer<typeof TranslateDesignationOutputSchema>;

export async function translateDesignation(input: TranslateDesignationInput): Promise<TranslateDesignationOutput> {
  return translateDesignationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateDesignationPrompt',
  input: {schema: TranslateDesignationInputSchema},
  output: {schema: TranslateDesignationOutputSchema},
  prompt: `You are an expert translator specializing in the Tirupur garment industry.
  
  Translate the following industrial job designation from English to Tamil and Hindi.
  Ensure the translations are professional, industry-standard, and commonly used by factories and workers in Tirupur.
  
  Example:
  English: Welfare Officer
  Tamil: நல அலுவலர்
  Hindi: कल्याण अधिकारी

  English Designation: {{{name}}}`,
});

const translateDesignationFlow = ai.defineFlow(
  {
    name: 'translateDesignationFlow',
    inputSchema: TranslateDesignationInputSchema,
    outputSchema: TranslateDesignationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
