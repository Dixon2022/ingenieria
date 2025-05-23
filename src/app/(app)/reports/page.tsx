
"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UI_TEXT, mockBranches, mockSalesOrdersForReports, DOCUMENT_STATUS_OPTIONS } from '@/lib/constants';
import { SalesOrder } from '@/types';
import { getSalesOrdersFromPOS } from '@/app/(app)/pos/page';
import { AlertCircle, Search, FileText, Calendar as CalendarDateIcon, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isWithinInterval, isValid, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7))); // Default to 7 days ago
  const [endDate, setEndDate] = useState<Date | undefined>(new Date()); // Default to today
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [displayedSales, setDisplayedSales] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDisplayedSales([]);

    if (!startDate || !endDate) {
      setError("Por favor, seleccione un rango de fechas.");
      setIsLoading(false);
      return;
    }
    if (startOfDay(startDate) > endOfDay(endDate)) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      setIsLoading(false);
      return;
    }

    try {
      const posSales = getSalesOrdersFromPOS(); 
      const allSalesOrders: SalesOrder[] = [...mockSalesOrdersForReports, ...posSales];
      
      const filteredSales = allSalesOrders.filter(order => {
        const orderDate = parseISO(order.orderDate);
        if (!isValid(orderDate)) return false;

        const isDateMatch = isWithinInterval(orderDate, { start: startOfDay(startDate), end: endOfDay(endDate) });
        const isBranchMatch = selectedBranch === "all" || order.branchId === selectedBranch;
        
        return isDateMatch && isBranchMatch;
      });

      if (filteredSales.length === 0) {
        setError("No se encontraron ventas para los filtros seleccionados.");
      }
      setDisplayedSales(filteredSales);
    } catch (err: any) {
      console.error(err);
      setError(UI_TEXT.ERROR_ANALYSIS + (err.message ? `: ${err.message}` : ''));
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBranchName = (branchId?: string) => mockBranches.find(b => b.id === branchId)?.name || branchId || '-';


  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <FileText className="mr-2 h-6 w-6" />
            {UI_TEXT.REPORTS_TITLE}
          </CardTitle>
          <CardDescription>{UI_TEXT.SALES_REPORT_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="p-4 bg-secondary/30">
              <CardHeader className="p-2">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-muted-foreground"/>
                  {UI_TEXT.REPORTS_FILTER_TITLE}
                </CardTitle>
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
                <Search className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {UI_TEXT.GENERATE_REPORT}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {displayedSales.length > 0 && !isLoading && (
        <Card className="shadow-xl mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Resultados de la Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{UI_TEXT.DOCUMENT_NUMBER}</TableHead>
                    <TableHead>{UI_TEXT.CUSTOMER_NAME}</TableHead>
                    <TableHead>{UI_TEXT.ORDER_DATE}</TableHead>
                    <TableHead>{UI_TEXT.BRANCH_LABEL}</TableHead>
                    <TableHead className="text-right">{UI_TEXT.TOTAL_AMOUNT}</TableHead>
                    <TableHead>{UI_TEXT.STATUS}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedSales.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.documentNumber}</TableCell>
                      <TableCell>{order.customerName || '-'}</TableCell>
                      <TableCell>{format(parseISO(order.orderDate), "PPP p", { locale: es })}</TableCell>
                      <TableCell>{getBranchName(order.branchId)}</TableCell>
                      <TableCell className="text-right">₡{order.totalAmount?.toFixed(0) || '0'}</TableCell>
                      <TableCell>{DOCUMENT_STATUS_OPTIONS[order.status.toUpperCase() as keyof typeof DOCUMENT_STATUS_OPTIONS]?.label || order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
       {displayedSales.length === 0 && !error && !isLoading && (
         <Card className="shadow-xl mt-6">
           <CardContent className="p-6 text-center text-muted-foreground">
             {UI_TEXT.NO_DATA}
           </CardContent>
         </Card>
       )}
    </div>
  );
}

    