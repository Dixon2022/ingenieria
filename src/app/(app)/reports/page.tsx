
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { UI_TEXT, mockBranches, mockSalesOrdersForReports } from '@/lib/constants';
import type { SalesOrder } from '@/types';
import { analyzeSalesReport, AnalyzeSalesReportOutput } from '@/ai/flows/sales-report-analyzer';
import { AlertCircle, CheckCircle, Loader2, Lightbulb, CalendarIcon as CalendarDateIcon, Filter } from 'lucide-react'; // Renamed CalendarIcon to avoid conflict
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getSalesOrdersFromPOS } from '@/app/(app)/pos/page';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(''); // Empty string for "All Branches"
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesReportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!startDate || !endDate) {
      setError("Por favor, seleccione un rango de fechas válido.");
      setIsLoading(false);
      return;
    }
    if (endDate < startDate) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate fetching all sales orders
      const posSales = getSalesOrdersFromPOS(); // Get sales from current POS session
      const allSalesOrders: SalesOrder[] = [...mockSalesOrdersForReports, ...posSales];
      
      // Filter sales orders
      const filteredSalesOrders = allSalesOrders.filter(order => {
        const orderDate = parseISO(order.orderDate);
        if (!isValid(orderDate)) return false;

        const isAfterStartDate = orderDate >= startDate;
        const isBeforeEndDate = orderDate <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999); // Include full end day
        const isCorrectBranch = selectedBranchId ? order.branchId === selectedBranchId : true;
        
        return isAfterStartDate && isBeforeEndDate && isCorrectBranch;
      });

      if (filteredSalesOrders.length === 0) {
        setError("No se encontraron ventas para los filtros seleccionados.");
        setIsLoading(false);
        return;
      }

      // Aggregate sales data
      const salesSummary = filteredSalesOrders.reduce((acc, order) => {
        order.items.forEach(item => {
          acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
        });
        return acc;
      }, {} as Record<string, number>);

      const ventasPayload = Object.entries(salesSummary).map(([itemName, qty]) => ({
        item: itemName,
        cantidadVendida: qty,
      }));

      const salesDataForAI = JSON.stringify({ ventas: ventasPayload });

      const result = await analyzeSalesReport({ salesData: salesDataForAI });
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
          <CardTitle className="text-2xl text-primary flex items-center">
            <Filter className="mr-2 h-6 w-6" />
            {UI_TEXT.REPORTS_FILTER_TITLE}
          </CardTitle>
          <CardDescription>{UI_TEXT.SALES_REPORT_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="startDate">{UI_TEXT.START_DATE}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="startDate" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
                    <Button id="endDate" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
                <Label htmlFor="branch">{UI_TEXT.BRANCH_LABEL}</Label>
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger id="branch" className="w-full mt-1">
                    <SelectValue placeholder={UI_TEXT.SELECT_BRANCH} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{UI_TEXT.ALL_BRANCHES}</SelectItem>
                    {mockBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {UI_TEXT.GENERATE_REPORT}
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


    