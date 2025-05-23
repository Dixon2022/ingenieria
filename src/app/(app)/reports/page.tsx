
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { UI_TEXT } from '@/lib/constants';
import { analyzeSalesReport, AnalyzeSalesReportOutput } from '@/ai/flows/sales-report-analyzer';
import { AlertCircle, CheckCircle, Loader2, Lightbulb, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ReportsPage() {
  const [salesDataJsonInput, setSalesDataJsonInput] = useState<string>(UI_TEXT.SALES_DATA_PLACEHOLDER || '');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!salesDataJsonInput.trim()) {
      setError("Por favor, ingrese los datos de ventas en formato JSON.");
      setIsLoading(false);
      return;
    }

    try {
      // Validate if the input is valid JSON (optional, but good practice)
      JSON.parse(salesDataJsonInput); 
      const result = await analyzeSalesReport({ salesData: salesDataJsonInput });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      if (err instanceof SyntaxError) {
        setError("Error: El JSON ingresado no es válido. Por favor, revise el formato.");
      } else {
        setError(UI_TEXT.ERROR_ANALYSIS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAnalysis = () => {
    if (!analysisResult) return;

    const jsonString = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "analisis_ventas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Lightbulb className="mr-2 h-6 w-6" />
            {UI_TEXT.REPORTS_TITLE}
          </CardTitle>
          <CardDescription>{UI_TEXT.SALES_REPORT_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="salesData">{UI_TEXT.SALES_DATA_LABEL}</Label>
              <Textarea
                id="salesData"
                value={salesDataJsonInput}
                onChange={(e) => setSalesDataJsonInput(e.target.value)}
                placeholder={UI_TEXT.SALES_DATA_PLACEHOLDER}
                rows={10}
                className="mt-1"
              />
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-primary flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              {UI_TEXT.ANALYSIS_RESULTS}
            </CardTitle>
            <Button onClick={handleDownloadAnalysis} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {UI_TEXT.DOWNLOAD_ANALYSIS_BUTTON}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{UI_TEXT.ITEMS_TO_ADJUST}:</h3>
              {(() => {
                if (analysisResult.itemsToAdjust && Array.isArray(analysisResult.itemsToAdjust)) {
                  if (analysisResult.itemsToAdjust.length > 0) {
                    return (
                      <ul className="list-disc list-inside bg-secondary/30 p-3 rounded-md">
                        {analysisResult.itemsToAdjust.map((item, index) => (
                          <li key={`${item}-${index}`} className="text-foreground">{item}</li>
                        ))}
                      </ul>
                    );
                  } else {
                    return <p className="text-muted-foreground">{UI_TEXT.NO_ITEMS_TO_ADJUST_SUGGESTED}</p>;
                  }
                } else { 
                  return <p className="text-muted-foreground">{UI_TEXT.ANALYSIS_DATA_UNAVAILABLE}</p>;
                }
              })()}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{UI_TEXT.REASONING}:</h3>
              <ScrollArea className="h-40 w-full rounded-md border p-3 bg-secondary/30">
                {typeof analysisResult.reasoning === 'string' && analysisResult.reasoning.trim() !== '' ? (
                  <p className="text-sm whitespace-pre-wrap text-foreground">{analysisResult.reasoning}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {typeof analysisResult.reasoning === 'string' 
                      ? UI_TEXT.NO_REASONING_PROVIDED 
                      : UI_TEXT.ANALYSIS_DATA_UNAVAILABLE}
                  </p>
                )}
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
