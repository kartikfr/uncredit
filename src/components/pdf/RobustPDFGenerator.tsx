import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createPortal } from 'react-dom';

interface RobustPDFGeneratorProps {
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

const RobustPDFGenerator: React.FC<RobustPDFGeneratorProps> = ({ 
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPDFContent, setShowPDFContent] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    setShowPDFContent(true);
    
    try {
      // Wait for the portal to render
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!pdfRef.current) {
        throw new Error('PDF content element not found');
      }

      console.log('Starting PDF generation...');
      console.log('PDF content element:', pdfRef.current);
      console.log('Element dimensions:', pdfRef.current.offsetWidth, 'x', pdfRef.current.offsetHeight);

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: 210 * 3.779527559, // A4 width in pixels
        height: 297 * 3.779527559, // A4 height in pixels
        scrollX: 0,
        scrollY: 0,
        windowWidth: 210 * 3.779527559,
        windowHeight: 297 * 3.779527559,
        onclone: (clonedDoc) => {
          console.log('Document cloned for PDF generation');
          const clonedElement = clonedDoc.querySelector('[data-pdf-content]');
          if (clonedElement) {
            console.log('Found cloned PDF content element');
            console.log('Cloned element dimensions:', clonedElement.offsetWidth, 'x', clonedElement.offsetHeight);
          }
        }
      });

      console.log('Canvas created successfully');
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png', 1.0);
      console.log('Image data generated, length:', imgData.length);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('PDF generation details:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        imgWidth: imgWidth,
        imgHeight: imgHeight,
        pageHeight: pageHeight,
        totalPages: Math.ceil(imgHeight / pageHeight)
      });

      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / pageHeight);
      console.log(`Content will be split across ${totalPages} pages`);

      // Simple approach: Add the full image to the first page
      // If it's too long, it will automatically be clipped, but we'll add additional pages
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If content is longer than one page, add additional pages with proper positioning
      if (totalPages > 1) {
        for (let pageNum = 1; pageNum < totalPages; pageNum++) {
          pdf.addPage();
          
          // Calculate the position for this page
          const position = -(pageNum * pageHeight);
          
          console.log(`Page ${pageNum + 1}:`, {
            position: position,
            imgHeight: imgHeight,
            pageHeight: pageHeight
          });

          // Add the same image but positioned to show the next portion
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        }
      }

      const fileName = `card-savings-${cardName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generated successfully:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setShowPDFContent(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Create simple chart representation using CSS
  const createPieChart = (data: any[]) => {
    const total = data.reduce((sum, item) => sum + item.savings, 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">No Data</span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-32">
        <div className="relative w-24 h-24">
          {data.map((item, index) => {
            const percentage = (item.savings / total) * 100;
            const rotation = data.slice(0, index).reduce((sum, prevItem) => 
              sum + (prevItem.savings / total) * 360, 0
            );
            return (
              <div
                key={index}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${item.chartColor || '#3B82F6'} ${rotation}deg, ${item.chartColor || '#3B82F6'} ${rotation + (percentage * 3.6)}deg, transparent ${rotation + (percentage * 3.6)}deg)`,
                }}
              />
            );
          })}
          <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  };

  const PDFContent = () => (
    <div 
      ref={pdfRef} 
      data-pdf-content
      className="fixed top-0 left-0 w-[210mm] h-[297mm] bg-white p-8 z-[9999]"
      style={{ 
        transform: 'scale(1)',
        transformOrigin: 'top left',
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: 9999,
        opacity: showPDFContent ? 1 : 0,
        pointerEvents: 'none'
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Card Savings Report</h1>
        <h2 className="text-lg text-gray-600 mb-1">{cardName}</h2>
        <p className="text-xs text-gray-500">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
          Executive Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <h4 className="text-xs font-semibold text-green-800 mb-1">Total Annual Savings</h4>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
            <p className="text-xs text-green-600">Per year</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="text-xs font-semibold text-red-800 mb-1">Joining Fees</h4>
            <p className="text-xl font-bold text-red-600">{formatCurrency(joiningFees)}</p>
            <p className="text-xs text-red-600">One-time</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="text-xs font-semibold text-blue-800 mb-1">Net Savings</h4>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(netSavings)}</p>
            <p className="text-xs text-blue-600">After fees</p>
          </div>
        </div>
      </div>

      {/* Visual Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
          Visual Analysis
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Savings Distribution
            </h4>
            {createPieChart(categoryBreakdown)}
            <div className="mt-3 space-y-1">
              {categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: item.chartColor || '#3B82F6' }}
                    />
                    <span className="text-gray-700">{item.displayName}</span>
                  </div>
                  <span className="text-gray-600 font-medium">{formatCurrency(item.savings)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Savings Overview
            </h4>
            <div className="space-y-2">
              {categoryBreakdown.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-700">{item.displayName}</span>
                    <span className="text-gray-600 font-medium">{formatCurrency(item.savings)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${(item.savings / totalSavings) * 100}%`,
                        backgroundColor: item.chartColor || '#3B82F6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Category-wise Breakdown
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Amount Spent</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Savings</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Percentage</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-xs text-gray-800 font-medium">{item.displayName}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatCurrency(item.userAmount)}</td>
                    <td className="px-3 py-2 text-xs text-green-600 font-semibold">{formatCurrency(item.savings)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatPercentage(item.percentage)}</td>
                    <td className="px-3 py-2 text-xs text-purple-600 font-medium">
                      {(item.points_earned || 0).toLocaleString()} R.P
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spending Details */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
          Your Spending Details
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Monthly Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Annual Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(calcValues)
                .filter(([_, value]) => value > 0)
                .map(([key, value], index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-xs text-gray-800 font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatCurrency(value)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatCurrency(value * 12)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
          Key Insights
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="text-xs font-semibold text-yellow-800 mb-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-2" />
              Best Performing Category
            </h4>
            {categoryBreakdown.length > 0 && (
              <div>
                <p className="text-sm font-bold text-yellow-700">
                  {categoryBreakdown[0].displayName}
                </p>
                <p className="text-xs text-yellow-600">
                  {formatCurrency(categoryBreakdown[0].savings)} savings
                </p>
              </div>
            )}
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="text-xs font-semibold text-blue-800 mb-2">ROI Analysis</h4>
            <p className="text-sm font-bold text-blue-700">
              {joiningFees > 0 ? ((netSavings / joiningFees) * 100).toFixed(1) : 'N/A'}%
            </p>
            <p className="text-xs text-blue-600">Return on joining fees</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6 pt-3 border-t border-gray-200">
        <p>Generated by Card Genius - Your trusted credit card comparison platform</p>
        <p className="mt-1">This report is based on your provided spending patterns and current card benefits</p>
      </div>
    </div>
  );

  return (
    <>
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className={`flex items-center space-x-2 ${className}`}
      >
        {isGenerating ? (
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

      {/* Render PDF content in portal when generating */}
      {showPDFContent && createPortal(<PDFContent />, document.body)}
    </>
  );
};

export default RobustPDFGenerator; 