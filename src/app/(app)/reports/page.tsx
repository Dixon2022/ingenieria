"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UI_TEXT } from '@/lib/constants';
import { analyzeSalesReport, AnalyzeSalesReportOutput } from '@/ai/flows/sales-report-analyzer';
import { AlertCircle, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ReportsPage() {
  const [salesData, setSalesData] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Validate if salesData is valid JSON
      let parsedSalesData;
      try {
        parsedSalesData = JSON.parse(salesData);
      } catch (jsonError) {
        setError("Los datos de ventas no están en formato JSON válido.");
        setIsLoading(false);
        return;
      }

      const result = await analyzeSalesReport({ salesData });
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(UI_TEXT.ERROR_ANALYSIS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{UI_TEXT.REPORTS_TITLE}</CardTitle>
          <CardDescription>{UI_TEXT.SALES_REPORT_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="salesData" className="text-lg font-medium">{UI_TEXT.SALES_DATA_LABEL}</Label>
              <Textarea
                id="salesData"
                value={salesData}
                onChange={(e) => setSalesData(e.target.value)}
                placeholder={UI_TEXT.SALES_DATA_PLACEHOLDER}
                rows={10}
                className="mt-1 text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Asegúrese de que el JSON incluye nombres de artículos y cantidades vendidas. Puede incluir inventario actual para un análisis más preciso.
              </p>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {UI_TEXT.ANALYZE_SALES}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              {UI_TEXT.ANALYSIS_RESULTS}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{UI_TEXT.ITEMS_TO_ADJUST}:</h3>
              {analysisResult.itemsToAdjust.length > 0 ? (
                <ul className="list-disc list-inside bg-secondary/30 p-3 rounded-md">
                  {analysisResult.itemsToAdjust.map((item, index) => (
                    <li key={index} className="text-foreground">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{UI_TEXT.NO_DATA}</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{UI_TEXT.REASONING}:</h3>
              <ScrollArea className="h-40 w-full rounded-md border p-3 bg-secondary/30">
                <p className="text-sm whitespace-pre-wrap text-foreground">{analysisResult.reasoning}</p>
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground">{UI_TEXT.INVENTORY_ADVICE}</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
