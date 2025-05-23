
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UI_TEXT, mockBranches, mockSalesOrdersForReports } from '@/lib/constants'; // Removed Textarea
import { analyzeSalesReport, AnalyzeSalesReportOutput } from '@/ai/flows/sales-report-analyzer';
import { SalesOrder } from '@/types';
import { getSalesOrdersFromPOS } from '@/app/(app)/pos/page';
import { AlertCircle, CheckCircle, Loader2, Lightbulb, Download, Calendar as CalendarDateIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!startDate || !endDate) {
      setError("Por favor, seleccione un rango de fechas.");
      setIsLoading(false);
      return;
    }
    if (startDate > endDate) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch or get sales orders
      const posSales = getSalesOrdersFromPOS(); // Sales from current POS session
      const allSalesOrders: SalesOrder[] = [...mockSalesOrdersForReports, ...posSales];
      
      // 2. Filter sales orders by date and branch
      const filteredSales = allSalesOrders.filter(order => {
        const orderDate = parseISO(order.orderDate);
        if (!isValid(orderDate)) return false;

        const isDateMatch = isWithinInterval(orderDate, { start: startDate, end: endDate });
        const isBranchMatch = selectedBranch === "all" || order.branchId === selectedBranch;
        // Consider only completed or confirmed sales for analysis
        const isStatusMatch = order.status === 'completed' || order.status === 'confirmed';
        
        return isDateMatch && isBranchMatch && isStatusMatch;
      });

      if (filteredSales.length === 0) {
        setError("No se encontraron ventas para los filtros seleccionados.");
        setIsLoading(false);
        return;
      }

      // 3. Aggregate sales data from filtered orders
      const aggregatedSales: { [itemName: string]: number } = {};
      filteredSales.forEach(order => {
        order.items.forEach(item => {
          aggregatedSales[item.productName] = (aggregatedSales[item.productName] || 0) + item.quantity;
        });
      });

      const salesDataForAI = {
        ventas: Object.entries(aggregatedSales).map(([item, cantidadVendida]) => ({
          item,
          cantidadVendida,
        })),
        // inventarioActual could be fetched here if needed, or omitted
        // For now, we omit it to simplify, the AI prompt can handle this.
      };
      
      const salesDataJson = JSON.stringify(salesDataForAI);

      const result = await analyzeSalesReport({ salesData: salesDataJson });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      setError(UI_TEXT.ERROR_ANALYSIS + (err.message ? `: ${err.message}` : ''));
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
    link.download = "analisis_ventas_filtrado.json";
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
            <Card className="p-4 bg-secondary/30">
              <CardHeader className="p-2">
                <CardTitle className="text-lg">{UI_TEXT.REPORTS_FILTER_TITLE}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">{UI_TEXT.START_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="startDate" variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarDateIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="endDate">{UI_TEXT.END_DATE}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="endDate" variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarDateIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="branch">{UI_TEXT.SELECT_BRANCH}</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder={UI_TEXT.SELECT_BRANCH} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{UI_TEXT.ALL_BRANCHES}</SelectItem>
                      {mockBranches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {UI_TEXT.GENERATE_ANALYSIS}
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
