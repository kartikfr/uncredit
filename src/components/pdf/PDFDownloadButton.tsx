import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFTemplate from './PDFTemplate';

interface PDFDownloadButtonProps {
  cardName: string;
  totalSavings: number;
  joiningFees: number;
  netSavings: number;
  categoryBreakdown: any[];
  savingsBreakdown: any[];
  calcValues: Record<string, number>;
  calcResult: any;
  className?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  cardName, 
  totalSavings, 
  joiningFees, 
  netSavings, 
  categoryBreakdown, 
  savingsBreakdown, 
  calcValues, 
  calcResult, 
  className 
}) => {
  const pdfData = {
    cardName,
    totalSavings,
    joiningFees,
    netSavings,
    categoryBreakdown,
    savingsBreakdown,
    calcValues,
    calcResult
  };

  const fileName = `card-savings-${cardName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<PDFTemplate data={pdfData} />}
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <Button
          disabled={loading}
          variant="outline"
          size="sm"
          className={`flex items-center space-x-2 ${className}`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton; 