import { Violation } from '../types';

export interface ActionOrder {
  orderType: 'SEIZURE_MEMO' | 'FORM_II_NOTICE' | 'COMPOUNDING_SUMMON' | 'RECTIFICATION_DIRECTIVE' | 'CLEARANCE';
  orderTitle: string;
  legalActSection: string;
  urgency: 'IMMEDIATE' | '7_DAYS' | '15_DAYS' | 'ROUTINE';
  competentAuthority: string;
  statutoryDirective: string;
  penaltySection: string;
  penaltiesSummary: string;
  nextSteps: string[];
}

/**
 * Derives comprehensive, authoritative enforcement action orders under the
 * Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.
 */
export function deriveStatutoryActionOrder(
  verdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS MANUAL REVIEW',
  violations: Violation[] = []
): ActionOrder {
  if (verdict === 'COMPLIANT' || violations.length === 0) {
    return {
      orderType: 'CLEARANCE',
      orderTitle: 'STATUTORY MARKET CLEARANCE & CERTIFICATE OF CONFORMITY',
      legalActSection: 'Rule 6 & Rule 24 of Legal Metrology (Packaged Commodities) Rules, 2011',
      urgency: 'ROUTINE',
      competentAuthority: 'Inspector of Legal Metrology, State Enforcement Wing',
      statutoryDirective:
        'The pre-packaged commodity satisfies all mandatory declarations under Section 18 of the Legal Metrology Act, 2009 read with Rule 6 of the PCR 2011. No statutory contravention detected. Permitted for distribution, wholesale dispatch, and unhindered retail sale across Indian territory.',
      penaltySection: 'Not Applicable (Full Conformity)',
      penaltiesSummary: 'Zero pecuniary penalty or compoundable liability.',
      nextSteps: [
        'Certificate filed in National Legal Metrology Central Repository (e-LM Portal).',
        'Batch tagged as compliant for periodic market surveillance cycle.',
        'Official Digital Verification Certificate issued to Manufacturer / Packer.',
      ],
    };
  }

  const hasCritical = violations.some((v) => v.severity === 'critical');
  const hasOriginMissing = violations.some((v) => v.ruleCode.includes('PCR-08') || v.ruleCode.includes('6(1)(g)'));
  const hasMRPViolation = violations.some((v) => v.ruleCode.includes('PCR-05') || v.ruleCode.includes('6(1)(e)'));
  const hasNetQtyViolation = violations.some((v) => v.ruleCode.includes('PCR-03') || v.ruleCode.includes('6(1)(c)'));
  const hasCareViolation = violations.some((v) => v.ruleCode.includes('PCR-07') || v.ruleCode.includes('6(1)(f)'));

  if (hasCritical || hasOriginMissing) {
    return {
      orderType: 'SEIZURE_MEMO',
      orderTitle: 'ORDER OF DETENTION & STATUTORY FORM-II NOTICE UNDER SECTION 15 & 18',
      legalActSection: 'Section 15 (Power of Inspection & Seizure) & Section 36(1) of Legal Metrology Act, 2009',
      urgency: 'IMMEDIATE',
      competentAuthority: 'Assistant Controller / Inspector of Legal Metrology',
      statutoryDirective:
        'Immediate stoppage of sale, distribution, and display of the non-compliant lot. Retailer and distributor are directed to hold the batch in safe custody under Section 15(1)(c). Show-Cause Notice under Form-II returnable within 7 calendar days to the office of the Controller.',
      penaltySection: 'Section 36(1) & Section 49, Legal Metrology Act, 2009',
      penaltiesSummary:
        'First offence: Fine up to ₹25,000. Second offence: Fine up to ₹50,000. Subsequent offences: Fine up to ₹1,00,000 or imprisonment up to 1 year, or both.',
      nextSteps: [
        'Issue Form-II Show Cause Notice with photographic evidence attachment.',
        'Summon Authorized Nominated Director under Section 49 for compounding / personal hearing.',
        'Seizure memo executed under Section 15(1)(b) if rectifying affidavit is not submitted within 7 days.',
      ],
    };
  }

  if (hasMRPViolation || hasNetQtyViolation) {
    return {
      orderType: 'FORM_II_NOTICE',
      orderTitle: 'STATUTORY SHOW-CAUSE NOTICE FOR LABELLING CONTRAVENTION',
      legalActSection: 'Section 18 & Section 36(1) of Legal Metrology Act, 2009 read with Rules 6(1)(e), 11 & 13 of PCR 2011',
      urgency: '7_DAYS',
      competentAuthority: 'Inspector of Legal Metrology, District Enforcement Cell',
      statutoryDirective:
        'The manufacturer / packer / importer is hereby directed to show cause within seven (7) business days why legal proceedings under Section 36(1) should not be initiated for non-declaration of mandatory price / net metric quantity standards. Sale of un-rectified units prohibited.',
      penaltySection: 'Section 36(1), Legal Metrology Act, 2009',
      penaltiesSummary: 'Liable for compounding fee up to ₹25,000 (first offence) under Section 53.',
      nextSteps: [
        'Serve statutory notice on registered packer address with mandatory PIN acknowledgement.',
        'Require submission of corrected label artwork and undertaking under Rule 33.',
        'Verify remedial over-stickering under supervision if authorized by Controller.',
      ],
    };
  }

  // Moderate / Review Required
  return {
    orderType: 'RECTIFICATION_DIRECTIVE',
    orderTitle: 'STATUTORY RECTIFICATION ADVISORY & 15-DAY COMPLIANCE DIRECTIVE',
    legalActSection: 'Rule 6(1)(f) / Rule 9 of PCR, 2011 and Section 18 of Legal Metrology Act, 2009',
    urgency: '15_DAYS',
    competentAuthority: 'Senior Inspector of Legal Metrology',
    statutoryDirective:
      'The packer is issued a 15-day statutory cure directive to correct deficiencies in consumer care helpline legibility or packaging font sizing. Failure to provide proof of corrective measures within 15 days shall lead to automatic escalation to prosecution under Section 36(1).',
    penaltySection: 'Rule 32 & Section 36(1), Legal Metrology Act, 2009',
    penaltiesSummary: 'Liable for administrative compounding or inspection escalation.',
    nextSteps: [
      'Provide verified customer support dial-in verification log to the Directorate.',
      'Submit revised commercial packaging artwork to the State Licensing Wing.',
      'Re-inspection scheduled within 21 days at designated distribution hub.',
    ],
  };
}
