import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonProps {
  data: any[];
  columns: {
    header: string;
    accessor: string | ((row: any) => any);
    format?: (value: any) => string;
  }[];
  filename: string;
  title?: string;
}

export const ExportButton = ({ data, columns, filename, title }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  // Prepare CSV data with proper transformation
  const csvHeaders = columns.map((col, index) => ({
    label: col.header,
    key: `col_${index}`, // Use index-based keys to avoid function issues
  }));

  const csvData = data.map((row) => {
    const csvRow: any = {};
    columns.forEach((col, index) => {
      const value = typeof col.accessor === "function"
        ? col.accessor(row)
        : row[col.accessor];
      const formattedValue = col.format ? col.format(value) : value;
      csvRow[`col_${index}`] = formattedValue || '';
    });
    return csvRow;
  });

  // Export to PDF
  const exportToPDF = () => {
    setIsExporting(true);
    try {
      // Use landscape orientation for better column width
      const doc = new jsPDF({
        orientation: columns.length > 8 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      if (title) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 15);
      }

      // Add metadata
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, title ? 22 : 15);
      doc.text(`Total Records: ${data.length}`, 14, title ? 27 : 20);

      // Prepare table data
      const headers = columns.map((col) => col.header);
      const rows = data.map((row) =>
        columns.map((col) => {
          const value = typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor];
          const formatted = col.format ? col.format(value) : value;
          return String(formatted || "");
        })
      );

      // Calculate column widths based on content
      const pageWidth = columns.length > 8 ? 297 : 210; // A4 landscape or portrait
      const margins = 28; // 14mm on each side
      const availableWidth = pageWidth - margins;
      const columnWidth = availableWidth / columns.length;

      // Generate table with optimized settings
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: title ? 32 : 25,
        styles: {
          fontSize: columns.length > 10 ? 6 : columns.length > 8 ? 7 : 8,
          cellPadding: columns.length > 10 ? 1 : 2,
          overflow: 'linebreak',
          cellWidth: 'wrap',
        },
        headStyles: {
          fillColor: [26, 26, 26],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248],
        },
        margin: { left: 14, right: 14 },
        columnStyles: Object.fromEntries(
          columns.map((_, index) => [
            index,
            {
              cellWidth: columnWidth,
              overflow: 'linebreak',
            }
          ])
        ),
      });

      // Save PDF
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1" disabled={isExporting}>
          <Download className="h-3 w-3" />
          <span className="text-xs">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={`${filename}.csv`}
          className="w-full"
        >
          <DropdownMenuItem>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as Excel (CSV)
          </DropdownMenuItem>
        </CSVLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
