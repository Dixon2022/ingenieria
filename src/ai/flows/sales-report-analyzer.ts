// SalesReportAnalyzer flow
'use server';
/**
 * @fileOverview Analyzes sales data and suggests inventory adjustments.
 *
 * - analyzeSalesReport - Analyzes sales data and suggests inventory adjustments.
 * - AnalyzeSalesReportInput - The input type for the analyzeSalesReport function.
 * - AnalyzeSalesReportOutput - The return type for the analyzeSalesReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSalesReportInputSchema = z.object({
  salesData: z
    .string()
    .describe('Sales data in JSON format, including item names and quantities sold.'),
});
export type AnalyzeSalesReportInput = z.infer<typeof AnalyzeSalesReportInputSchema>;

const AnalyzeSalesReportOutputSchema = z.object({
  itemsToAdjust: z
    .array(z.string())
    .describe('List of item names that need inventory adjustments.'),
  reasoning: z
    .string()
    .describe('Explanation of why these items were flagged for adjustment.'),
});
export type AnalyzeSalesReportOutput = z.infer<typeof AnalyzeSalesReportOutputSchema>;

export async function analyzeSalesReport(input: AnalyzeSalesReportInput): Promise<AnalyzeSalesReportOutput> {
  return analyzeSalesReportFlow(input);
}

const analyzeSalesReportPrompt = ai.definePrompt({
  name: 'analyzeSalesReportPrompt',
  input: {schema: AnalyzeSalesReportInputSchema},
  output: {schema: AnalyzeSalesReportOutputSchema},
  prompt: `You are an inventory management expert analyzing sales data for a bakery.

  Based on the following sales data, identify which items need inventory adjustments (increase or decrease).
  Explain your reasoning for each item.

  Sales Data:
  {{salesData}}

  Highlight items that need immediate attention and provide a brief explanation.
  Return the list of items to adjust and the reasoning behind it in the format specified by the output schema.`,
});

const analyzeSalesReportFlow = ai.defineFlow(
  {
    name: 'analyzeSalesReportFlow',
    inputSchema: AnalyzeSalesReportInputSchema,
    outputSchema: AnalyzeSalesReportOutputSchema,
  },
  async input => {
    const {output} = await analyzeSalesReportPrompt(input);
    return output!;
  }
);
