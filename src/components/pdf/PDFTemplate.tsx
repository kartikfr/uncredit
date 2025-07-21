import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#6b7280',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: '1px solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: '1px solid #f3f4f6',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryAmount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: 'bold',
  },
  categoryPercentage: {
    fontSize: 10,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#9ca3af',
  },
});

interface PDFTemplateProps {
  data: {
    cardName: string;
    totalSavings: number;
    joiningFees: number;
    netSavings: number;
    categoryBreakdown: any[];
    savingsBreakdown: any[];
    calcValues: Record<string, number>;
    calcResult: any;
  };
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Card Savings Report</Text>
          <Text style={styles.subtitle}>{data.cardName}</Text>
          <Text style={styles.date}>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Text>
        </View>

        {/* Savings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Savings Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Total Annual Savings</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.totalSavings)}</Text>
              <Text style={styles.summaryLabel}>Per year</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Joining Fees</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.joiningFees)}</Text>
              <Text style={styles.summaryLabel}>One-time</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Net Savings</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.netSavings)}</Text>
              <Text style={styles.summaryLabel}>After fees</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {data.categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category-wise Breakdown</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Category</Text>
                <Text style={styles.tableHeaderCell}>Amount Spent</Text>
                <Text style={styles.tableHeaderCell}>Savings</Text>
                <Text style={styles.tableHeaderCell}>Percentage</Text>
              </View>
              {data.categoryBreakdown.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.displayName}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(item.userAmount)}</Text>
                  <Text style={styles.tableCell}>{formatCurrency(item.savings)}</Text>
                  <Text style={styles.tableCell}>{formatPercentage(item.percentage)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Spending Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Spending Details</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Category</Text>
              <Text style={styles.tableHeaderCell}>Monthly Amount</Text>
            </View>
            {Object.entries(data.calcValues)
              .filter(([_, value]) => value > 0)
              .map(([key, value], index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.tableCell}>{formatCurrency(value)}</Text>
                </View>
              ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Card Genius - Your trusted credit card comparison platform
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

export default PDFTemplate; 