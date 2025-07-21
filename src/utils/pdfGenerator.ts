import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFData {
  cardName: string;
  totalSavings: number;
  joiningFees: number;
  netSavings: number;
  categoryBreakdown: any[];
  savingsBreakdown: any[];
  calcValues: Record<string, number>;
  calcResult: any;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageWidth: number = 210;
  private margin: number = 20;
  private contentWidth: number = 170;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
  }

  private addPage() {
    this.pdf.addPage();
    this.currentY = 20;
  }

  private addTitle(text: string, fontSize: number = 16) {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(text, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += fontSize / 2 + 5;
  }

  private addSubtitle(text: string, fontSize: number = 12) {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(text, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += fontSize / 2 + 3;
  }

  private addText(text: string, x: number = this.margin, fontSize: number = 10) {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'normal');
    
    // Handle text wrapping
    const lines = this.pdf.splitTextToSize(text, this.contentWidth);
    
    if (this.currentY + (lines.length * fontSize / 2) > 280) {
      this.addPage();
    }
    
    this.pdf.text(lines, x, this.currentY);
    this.currentY += lines.length * fontSize / 2 + 2;
  }

  private addBoldText(text: string, x: number = this.margin, fontSize: number = 10) {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    
    const lines = this.pdf.splitTextToSize(text, this.contentWidth);
    
    if (this.currentY + (lines.length * fontSize / 2) > 280) {
      this.addPage();
    }
    
    this.pdf.text(lines, x, this.currentY);
    this.currentY += lines.length * fontSize / 2 + 2;
  }

  private addSavingsSummary(data: PDFData) {
    this.addTitle('Savings Summary', 18);
    this.currentY += 5;

    // Create summary table
    const summaryData = [
      ['Metric', 'Amount'],
      ['Total Annual Savings', `₹${data.totalSavings.toLocaleString()}`],
      ['Joining Fees', `₹${data.joiningFees.toLocaleString()}`],
      ['Net Savings', `₹${data.netSavings.toLocaleString()}`],
    ];

    this.addTable(summaryData, [60, 110]);
    this.currentY += 10;
  }

  private addTable(data: string[][], columnWidths: number[]) {
    const startX = this.margin;
    const startY = this.currentY;
    const rowHeight = 8;
    const headerHeight = 10;

    // Check if table fits on current page
    if (startY + (data.length * rowHeight) > 280) {
      this.addPage();
    }

    // Draw table
    data.forEach((row, rowIndex) => {
      let currentX = startX;
      
      row.forEach((cell, colIndex) => {
        const cellWidth = columnWidths[colIndex] || 50;
        
        // Draw cell border
        this.pdf.rect(currentX, startY + (rowIndex * rowHeight), cellWidth, rowHeight, 'S');
        
        // Add cell content
        this.pdf.setFontSize(8);
        if (rowIndex === 0) {
          this.pdf.setFont('helvetica', 'bold');
        } else {
          this.pdf.setFont('helvetica', 'normal');
        }
        
        const lines = this.pdf.splitTextToSize(cell, cellWidth - 2);
        this.pdf.text(lines, currentX + 1, startY + (rowIndex * rowHeight) + 3);
        
        currentX += cellWidth;
      });
    });

    this.currentY = startY + (data.length * rowHeight) + 5;
  }

  private addCategoryBreakdown(categoryBreakdown: any[]) {
    this.addTitle('Category-wise Breakdown', 16);
    this.currentY += 5;

    if (categoryBreakdown.length === 0) {
      this.addText('No category data available');
      return;
    }

    // Create category table
    const tableData = [
      ['Category', 'Amount Spent', 'Savings', 'Percentage']
    ];

    categoryBreakdown.forEach(item => {
      tableData.push([
        item.displayName,
        `₹${item.userAmount.toLocaleString()}`,
        `₹${item.savings.toLocaleString()}`,
        `${item.percentage.toFixed(1)}%`
      ]);
    });

    this.addTable(tableData, [50, 40, 40, 40]);
  }

  private addSpendingDetails(calcValues: Record<string, number>) {
    this.addTitle('Your Spending Details', 16);
    this.currentY += 5;

    const spendingData = Object.entries(calcValues)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => [key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), `₹${value.toLocaleString()}`]);

    if (spendingData.length === 0) {
      this.addText('No spending data available');
      return;
    }

    const tableData = [['Category', 'Monthly Amount'], ...spendingData];
    this.addTable(tableData, [100, 70]);
  }

  private async addCharts() {
    // Try to capture charts as images
    try {
      const chartElements = document.querySelectorAll('.recharts-wrapper');
      
      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i] as HTMLElement;
        
        if (this.currentY > 200) {
          this.addPage();
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 150;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
        this.currentY += imgHeight + 10;
      }
    } catch (error) {
      console.log('Could not capture charts:', error);
    }
  }

  private addFooter() {
    this.currentY = 280;
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Generated by Card Genius', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, this.pageWidth / 2, this.currentY + 3, { align: 'center' });
  }

  async generatePDF(data: PDFData): Promise<void> {
    // Add header
    this.addTitle('Card Savings Report', 20);
    this.addSubtitle(`Card: ${data.cardName}`, 14);
    this.addSubtitle(`Generated on: ${new Date().toLocaleDateString()}`, 10);
    this.currentY += 10;

    // Add savings summary
    this.addSavingsSummary(data);

    // Add spending details
    this.addSpendingDetails(data.calcValues);

    // Add category breakdown
    this.addCategoryBreakdown(data.categoryBreakdown);

    // Try to add charts
    await this.addCharts();

    // Add footer to all pages
    const pageCount = this.pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.addFooter();
    }

    // Save PDF
    const fileName = `card-savings-${data.cardName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.pdf.save(fileName);
  }
}

export const generateCardSavingsPDF = async (data: PDFData): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generatePDF(data);
}; 