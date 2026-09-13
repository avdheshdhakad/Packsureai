import {
  Declaration,
  ComplianceRule,
  Violation,
  ComplianceBreakdown,
  ComplianceVerdict,
  ImageQualityCheck,
} from '../src/types';

export interface EvaluationResult {
  score: number;
  verdict: ComplianceVerdict;
  requiresManualReview: boolean;
  breakdown: ComplianceBreakdown;
  violations: Violation[];
}

/**
 * Validates declarations against Legal Metrology Rules, 2011 and calculates compliance metrics
 */
export function evaluateCompliance(
  scanId: string,
  declarations: Declaration[],
  rules: ComplianceRule[],
  imageQuality?: ImageQualityCheck
): EvaluationResult {
  const activeRules = rules.filter((r) => r.active);
  const violations: Violation[] = [];

  let totalMandatory = 0;
  let passedMandatory = 0;
  let totalDeclarations = declarations.length;
  let validDeclarations = 0;
  let sumConfidence = 0;

  for (const rule of activeRules) {
    const dec = declarations.find((d) => d.type === rule.declarationType);
    const isOverridden = dec?.officerOverride?.status;
    const effectiveStatus = isOverridden || dec?.status || 'missing';
    const effectiveValue = dec?.officerOverride?.value || dec?.detectedValue || '';

    if (rule.required) {
      totalMandatory++;
    }

    if (effectiveStatus === 'detected') {
      validDeclarations++;
      if (rule.required) passedMandatory++;
    } else if (effectiveStatus === 'missing') {
      violations.push({
        id: `viol-${scanId}-${rule.ruleCode}-${Date.now()}`,
        scanId,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        title: `${rule.declarationName} is completely missing`,
        severity: rule.severity,
        detectedValue: 'NOT FOUND',
        expectedValue: rule.expectedFormat,
        confidence: 96,
        recommendedAction: `Issue statutory notice under ${rule.legalMetrologyReference} for omission of mandatory declaration.`,
        legalReference: rule.legalMetrologyReference,
        boundingBox: dec?.boundingBox,
        resolved: false,
      });
    } else if (effectiveStatus === 'invalid') {
      violations.push({
        id: `viol-${scanId}-${rule.ruleCode}-${Date.now()}`,
        scanId,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        title: `Invalid ${rule.declarationName} format`,
        severity: rule.severity === 'critical' ? 'critical' : 'high',
        detectedValue: effectiveValue || 'Invalid format',
        expectedValue: rule.expectedFormat,
        confidence: dec?.confidence || 85,
        recommendedAction: `Direct manufacturer/packer to rectify label formatting under ${rule.legalMetrologyReference}.`,
        legalReference: rule.legalMetrologyReference,
        boundingBox: dec?.boundingBox,
        resolved: false,
      });
    } else if (effectiveStatus === 'low_confidence') {
      violations.push({
        id: `viol-${scanId}-${rule.ruleCode}-${Date.now()}`,
        scanId,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        title: `${rule.declarationName} has ambiguous or low-confidence declaration`,
        severity: rule.severity === 'critical' ? 'high' : 'medium',
        detectedValue: effectiveValue,
        expectedValue: rule.expectedFormat,
        confidence: dec?.confidence || 70,
        recommendedAction: `Officer physical verification recommended to verify print clarity and compliance.`,
        legalReference: rule.legalMetrologyReference,
        boundingBox: dec?.boundingBox,
        resolved: false,
      });
    }

    sumConfidence += dec?.confidence || 50;
  }

  // Calculate Sub-Scores (0 - 100)
  const declarationCompleteness = totalDeclarations > 0
    ? Math.round((validDeclarations / totalDeclarations) * 100)
    : 0;

  const mandatoryFieldCompliance = totalMandatory > 0
    ? Math.round((passedMandatory / totalMandatory) * 100)
    : 0;

  const formatValidity = Math.max(0, 100 - (violations.length * 14));
  const avgOcrConfidence = declarations.length > 0
    ? Math.round(sumConfidence / declarations.length)
    : 80;
  const readability = imageQuality?.overallScore ?? Math.min(100, Math.round(avgOcrConfidence * 0.95));

  // Overall Weighted Score calculation
  const weightedScore = Math.round(
    (mandatoryFieldCompliance * 0.35) +
    (declarationCompleteness * 0.25) +
    (formatValidity * 0.20) +
    (avgOcrConfidence * 0.10) +
    (readability * 0.10)
  );

  const score = Math.max(0, Math.min(100, weightedScore));

  // Determine Verdict and Manual Review need
  const hasCriticalViolations = violations.some((v) => v.severity === 'critical' && !v.resolved);
  const hasLowConfidenceDeclarations = declarations.some((d) => d.status === 'low_confidence');
  const imageQualityPoor = (imageQuality?.overallScore ?? 100) < 70;

  let verdict: ComplianceVerdict = 'COMPLIANT';
  let requiresManualReview = false;

  if (hasCriticalViolations || score < 55) {
    verdict = 'NON-COMPLIANT';
    requiresManualReview = false;
  } else if (score < 85 || hasLowConfidenceDeclarations || imageQualityPoor || violations.length > 0) {
    verdict = 'NEEDS MANUAL REVIEW';
    requiresManualReview = true;
  } else {
    verdict = 'COMPLIANT';
    requiresManualReview = false;
  }

  return {
    score,
    verdict,
    requiresManualReview,
    breakdown: {
      declarationCompleteness,
      ocrConfidence: avgOcrConfidence,
      formatValidity,
      readability,
      mandatoryFieldCompliance,
    },
    violations,
  };
}
