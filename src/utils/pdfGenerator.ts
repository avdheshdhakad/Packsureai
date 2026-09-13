import { jsPDF } from 'jspdf';
import { InspectionReport } from '../types';
import { deriveStatutoryActionOrder } from './statutoryEnforcement';

export function generateInspectionPDF(report: InspectionReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const actionOrder = deriveStatutoryActionOrder(report.verdict, report.violations);

  // 1. Indian National Tricolor Header Strip
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(0, 0, pageWidth / 3, 2.5, 'F');
  doc.setFillColor(241, 245, 249); // White/Neutral
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 2.5, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect((2 * pageWidth) / 3, 0, pageWidth / 3, 2.5, 'F');

  // 2. Official Header Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 2.5, pageWidth, 33, 'F');

  // Title & Ministry
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', pageWidth / 2, 16.5, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('DIRECTORATE OF LEGAL METROLOGY • CENTRAL VERIFICATION DIVISION', pageWidth / 2, 21.5, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('STATUTORY PACKAGED COMMODITY COMPLIANCE CERTIFICATE', pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Issued under Sections 15 & 18 of Legal Metrology Act, 2009 & PCR Rules, 2011', pageWidth / 2, 33, { align: 'center' });

  // 3. Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, 38, pageWidth - 24, 25, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Certificate No: ${report.reportNumber}`, 16, 44);
  doc.text(`Inspection ID: ${report.scanId}`, 16, 50);
  doc.text(`Date of Audit: ${new Date(report.issuedAt).toLocaleString('en-IN')}`, 16, 56);

  doc.text(`Commodity: ${report.product.name.slice(0, 32)}`, 110, 44);
  doc.text(`Manufacturer/Packer: ${report.product.brand.slice(0, 32)}`, 110, 50);
  doc.text(`Authorized Inspector: ${report.inspector.name} (${report.inspector.badge})`, 110, 56);

  // 4. Verdict Status Banner
  let verdictColor: [number, number, number] = [16, 185, 129]; // emerald
  if (report.verdict === 'NON-COMPLIANT') verdictColor = [225, 29, 72]; // rose
  if (report.verdict === 'NEEDS MANUAL REVIEW') verdictColor = [217, 119, 6]; // amber

  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(12, 65, pageWidth - 24, 11, 2, 2, 'F');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(
    `STATUTORY VERDICT: ${report.verdict}   |   COMPLIANCE SCORE: ${report.complianceScore}%   |   OCR CONFIDENCE: ${report.ocrConfidence}%`,
    pageWidth / 2,
    72,
    { align: 'center' }
  );

  // 5. Declarations Table Header
  let yPos = 80;
  doc.setFillColor(30, 41, 59);
  doc.rect(12, yPos, pageWidth - 24, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('MANDATORY STATUTORY FIELD', 15, yPos + 4.5);
  doc.text('DETECTED ON PACKAGING', 75, yPos + 4.5);
  doc.text('RULE ID', 140, yPos + 4.5);
  doc.text('STATUS', 165, yPos + 4.5);
  doc.text('CONF.', 186, yPos + 4.5);

  yPos += 6.5;

  // Declarations Table Rows (compacted to fit professional 1-page certificate)
  doc.setFont('helvetica', 'normal');
  report.declarations.slice(0, 8).forEach((dec, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, yPos, pageWidth - 24, 7, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(12, yPos + 7, pageWidth - 12, yPos + 7);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(doc.splitTextToSize(dec.label, 56)[0] || '', 15, yPos + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const valText = dec.officerOverride?.value || dec.detectedValue || 'NOT FOUND / OMITTED';
    const splitVal = doc.splitTextToSize(valText, 62);
    doc.text(splitVal[0] || '', 75, yPos + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(29, 78, 216);
    doc.text(dec.ruleCode, 140, yPos + 4.5);

    if (dec.status === 'detected') {
      doc.setTextColor(5, 150, 105);
      doc.text('PASS', 165, yPos + 4.5);
    } else if (dec.status === 'low_confidence') {
      doc.setTextColor(217, 119, 6);
      doc.text('REVIEW', 165, yPos + 4.5);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('FAIL', 165, yPos + 4.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${dec.confidence}%`, 186, yPos + 4.5);

    yPos += 7;
  });

  yPos += 4;

  // 6. Statutory Enforcement Action & Order Block
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, yPos, pageWidth - 24, 38, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  if (report.verdict === 'COMPLIANT') {
    doc.setTextColor(22, 101, 52);
  } else {
    doc.setTextColor(185, 28, 28);
  }
  doc.text(`GAZETTED STATUTORY ORDER: ${actionOrder.orderTitle}`, 16, yPos + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Legal Jurisdiction: ${actionOrder.legalActSection}`, 16, yPos + 11);
  doc.text(`Urgency Level: ${actionOrder.urgency.replace('_', ' ')}`, 140, yPos + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const directiveLines = doc.splitTextToSize(actionOrder.statutoryDirective, pageWidth - 32);
  doc.text(directiveLines.slice(0, 3), 16, yPos + 16);

  // Penalties summary line
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(`Penalty Liability: ${actionOrder.penaltySection} — ${actionOrder.penaltiesSummary}`, 16, yPos + 27);

  // Next steps
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Follow-up Action: 1. ${actionOrder.nextSteps[0] || 'Official record archived.'}`, 16, yPos + 32);
  doc.text(`                  2. ${actionOrder.nextSteps[1] || 'Periodic surveillance scheduled.'}`, 16, yPos + 36);

  yPos += 42;

  // 7. Officer Remarks
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('OFFICER REMARKS & VERIFICATION DETERMINATION:', 12, yPos + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const remarks = doc.splitTextToSize(report.summaryRemarks, pageWidth - 24);
  doc.text(remarks.slice(0, 2), 12, yPos + 8.5);

  yPos += 16;

  // 8. Official Signature & Stamp Chamber
  const chamberY = yPos;
  doc.setDrawColor(203, 213, 225);
  doc.line(12, chamberY, pageWidth - 12, chamberY);

  // Left: Officer Signature
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHORIZED OFFICER SIGNATURE:', 16, chamberY + 5);

  // Draw cursive realistic signature line in blue ink
  doc.setDrawColor(29, 78, 216); // Blue ink
  doc.setLineWidth(0.6);
  // Cursive bezier-like flourish strokes
  doc.lines([[10, -5], [15, 6], [12, -7], [18, 4], [25, -5], [15, 3]], 18, chamberY + 14);
  doc.line(16, chamberY + 17, 72, chamberY + 17); // Signature base line
  doc.setLineWidth(0.2); // reset

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(report.inspector.name, 16, chamberY + 22);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${report.inspector.department}`, 16, chamberY + 26);
  doc.setTextColor(29, 78, 216);
  doc.text(`Badge ID: ${report.inspector.badge}  •  DSC Validated`, 16, chamberY + 30);

  // Center: Official Department Ink Stamp (Circular)
  const stampCenterX = pageWidth / 2 + 10;
  const stampCenterY = chamberY + 18;

  let stampColor: [number, number, number] = [4, 120, 87]; // Emerald stamp
  if (report.verdict === 'NON-COMPLIANT') stampColor = [190, 18, 60]; // Rose stamp
  if (report.verdict === 'NEEDS MANUAL REVIEW') stampColor = [180, 83, 9]; // Amber stamp

  doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setLineWidth(0.8);
  doc.circle(stampCenterX, stampCenterY, 15, 'S'); // Outer circle
  doc.setLineWidth(0.3);
  doc.circle(stampCenterX, stampCenterY, 12.8, 'S'); // Inner circle

  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.text('GOVT OF INDIA', stampCenterX, stampCenterY - 8, { align: 'center' });
  doc.setFontSize(4.5);
  doc.text('LEGAL METROLOGY DEPT', stampCenterX, stampCenterY - 5, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(
    report.verdict === 'COMPLIANT' ? '★ PASSED ★' : '★ ACTION ★',
    stampCenterX,
    stampCenterY,
    { align: 'center' }
  );

  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-IN'), stampCenterX, stampCenterY + 4, { align: 'center' });
  doc.text('PCR 2011 • SEC 18', stampCenterX, stampCenterY + 8, { align: 'center' });

  // Right: E-Verification & Digital Security Hash
  const rightX = pageWidth - 16;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DIGITAL HASH & AUTHENTICATION:', rightX, chamberY + 5, { align: 'right' });

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(pageWidth - 62, chamberY + 8, 48, 22, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text('SHA-256 VERIFIED', rightX - 24, chamberY + 13, { align: 'center' });

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(report.reportNumber.slice(0, 18), rightX - 24, chamberY + 17, { align: 'center' });
  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVT METROLOGY SECURE', rightX - 24, chamberY + 22, { align: 'center' });
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(5.5);
  doc.text('Portal: e-metrology.gov.in', rightX - 24, chamberY + 27, { align: 'center' });

  // 9. Document Legal Footnote
  const footerY = pageHeight - 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, footerY - 2, pageWidth - 12, footerY - 2);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('PackSure AI Statutory Inspection Engine • Ministry of Consumer Affairs, Food & Public Distribution', 12, footerY + 2);
  doc.text('Digitally Authenticated Certificate pursuant to Section 18 of Legal Metrology Act, 2009', pageWidth - 12, footerY + 2, { align: 'right' });

  // Trigger download
  const cleanName = report.product.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  doc.save(`Legal_Metrology_Certificate_${cleanName}_${Date.now()}.pdf`);
}
