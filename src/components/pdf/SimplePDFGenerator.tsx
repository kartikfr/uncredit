import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SimplePDFGeneratorProps {
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

const SimplePDFGenerator: React.FC<SimplePDFGeneratorProps> = ({ 
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
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!pdfRef.current) {
      console.error('PDF reference not found');
      return;
    }

    setIsGenerating(true);
    try {
      // Temporarily make the PDF content visible for capture
      const originalStyle = pdfRef.current.style;
      pdfRef.current.style.position = 'fixed';
      pdfRef.current.style.top = '0';
      pdfRef.current.style.left = '0';
      pdfRef.current.style.zIndex = '9999';
      pdfRef.current.style.opacity = '1';
      pdfRef.current.style.pointerEvents = 'none';
      pdfRef.current.style.transform = 'scale(1)';
      pdfRef.current.style.transformOrigin = 'top left';

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Capturing PDF content...');
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging for debugging
        width: 210 * 3.779527559, // A4 width in pixels
        height: 297 * 3.779527559, // A4 height in pixels
        scrollX: 0,
        scrollY: 0,
        windowWidth: 210 * 3.779527559,
        windowHeight: 297 * 3.779527559,
        onclone: (clonedDoc) => {
          console.log('Cloned document for PDF generation');
          const clonedElement = clonedDoc.querySelector('[data-pdf-content]');
          if (clonedElement) {
            console.log('Found PDF content element:', clonedElement);
          }
        }
      });

      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

      // Restore original style
      pdfRef.current.style.position = originalStyle.position;
      pdfRef.current.style.top = originalStyle.top;
      pdfRef.current.style.left = originalStyle.left;
      pdfRef.current.style.zIndex = originalStyle.zIndex;
      pdfRef.current.style.opacity = originalStyle.opacity;
      pdfRef.current.style.pointerEvents = originalStyle.pointerEvents;
      pdfRef.current.style.transform = originalStyle.transform;
      pdfRef.current.style.transformOrigin = originalStyle.transformOrigin;

      const imgData = canvas.toDataURL('image/png', 1.0);
      console.log('Image data generated, length:', imgData.length);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `card-savings-${cardName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generated successfully:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
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
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-500">No Data</span>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative w-32 h-32">
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
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-700">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    );
  };

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

      {/* Hidden PDF Content */}
      <div 
        ref={pdfRef} 
        data-pdf-content
        className="fixed top-0 left-0 w-[210mm] h-[297mm] bg-white p-8 opacity-0 pointer-events-none"
        style={{ 
          transform: 'scale(0.5)', 
          transformOrigin: 'top left',
          zIndex: -9999,
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Card Savings Report</h1>
          <h2 className="text-xl text-gray-600 mb-1">{cardName}</h2>
          <p className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Executive Summary
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-1">Total Annual Savings</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
              <p className="text-xs text-green-600">Per year</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-800 mb-1">Joining Fees</h4>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(joiningFees)}</p>
              <p className="text-xs text-red-600">One-time</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Net Savings</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(netSavings)}</p>
              <p className="text-xs text-blue-600">After fees</p>
            </div>
          </div>
        </div>

        {/* Visual Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Visual Analysis
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Savings Distribution
              </h4>
              {createPieChart(categoryBreakdown)}
              <div className="mt-4 space-y-2">
                {categoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.chartColor }}
                      />
                      <span className="text-gray-700">{item.displayName}</span>
                    </div>
                    <span className="text-gray-600 font-medium">{formatCurrency(item.savings)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Savings Overview
              </h4>
              <div className="space-y-3">
                {categoryBreakdown.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.displayName}</span>
                      <span className="text-gray-600 font-medium">{formatCurrency(item.savings)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(item.savings / totalSavings) * 100}%`,
                          backgroundColor: item.chartColor 
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
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
              Category-wise Breakdown
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount Spent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Savings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((item, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.displayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.userAmount)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-semibold">{formatCurrency(item.savings)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatPercentage(item.percentage)}</td>
                      <td className="px-4 py-3 text-sm text-purple-600 font-medium">
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
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Your Spending Details
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monthly Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Annual Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(calcValues)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value], index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(value)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(value * 12)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Key Insights
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Best Performing Category
              </h4>
              {categoryBreakdown.length > 0 && (
                <div>
                  <p className="text-lg font-bold text-yellow-700">
                    {categoryBreakdown[0].displayName}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {formatCurrency(categoryBreakdown[0].savings)} savings
                  </p>
                </div>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">ROI Analysis</h4>
              <p className="text-lg font-bold text-blue-700">
                {joiningFees > 0 ? ((netSavings / joiningFees) * 100).toFixed(1) : 'N/A'}%
              </p>
              <p className="text-sm text-blue-600">Return on joining fees</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>Generated by Card Genius - Your trusted credit card comparison platform</p>
          <p className="mt-1">This report is based on your provided spending patterns and current card benefits</p>
        </div>
      </div>
    </>
  );
};

export default SimplePDFGenerator; 