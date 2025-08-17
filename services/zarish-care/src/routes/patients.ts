import { Router } from 'express';
import { PatientController } from '../controllers/PatientController';
import { authenticate, requirePermissions, requireProject } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const patientController = new PatientController();

// Patient management routes
router.get(
  '/patients',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatients)
);

router.get(
  '/patients/:id',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatientById)
);

router.post(
  '/patients',
  authenticate,
  requirePermissions(['patients.write']),
  requireProject,
  asyncHandler(patientController.createPatient)
);

router.put(
  '/patients/:id',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.updatePatient)
);

router.delete(
  '/patients/:id',
  authenticate,
  requirePermissions(['patients.delete']),
  asyncHandler(patientController.deletePatient)
);

// Patient search routes
router.get(
  '/patients/search/:query',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.searchPatients)
);

router.get(
  '/patients/by-mrn/:mrn',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatientByMRN)
);

// Patient registration routes
router.post(
  '/patients/:id/register',
  authenticate,
  requirePermissions(['patients.register']),
  asyncHandler(patientController.registerPatient)
);

router.post(
  '/patients/:id/check-in',
  authenticate,
  requirePermissions(['patients.checkin']),
  asyncHandler(patientController.checkInPatient)
);

router.post(
  '/patients/:id/check-out',
  authenticate,
  requirePermissions(['patients.checkout']),
  asyncHandler(patientController.checkOutPatient)
);

// Patient demographics routes
router.get(
  '/patients/:id/demographics',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatientDemographics)
);

router.put(
  '/patients/:id/demographics',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.updatePatientDemographics)
);

// Patient contacts routes
router.get(
  '/patients/:id/contacts',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatientContacts)
);

router.post(
  '/patients/:id/contacts',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.addPatientContact)
);

router.put(
  '/patients/:id/contacts/:contactId',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.updatePatientContact)
);

router.delete(
  '/patients/:id/contacts/:contactId',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.removePatientContact)
);

// Patient identifiers routes
router.get(
  '/patients/:id/identifiers',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatientIdentifiers)
);

router.post(
  '/patients/:id/identifiers',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.addPatientIdentifier)
);

router.put(
  '/patients/:id/identifiers/:identifierId',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.updatePatientIdentifier)
);

router.delete(
  '/patients/:id/identifiers/:identifierId',
  authenticate,
  requirePermissions(['patients.write']),
  asyncHandler(patientController.removePatientIdentifier)
);

// Patient visits routes
router.get(
  '/patients/:id/visits',
  authenticate,
  requirePermissions(['visits.read']),
  asyncHandler(patientController.getPatientVisits)
);

router.post(
  '/patients/:id/visits',
  authenticate,
  requirePermissions(['visits.write']),
  asyncHandler(patientController.createPatientVisit)
);

// Patient programs routes
router.get(
  '/patients/:id/programs',
  authenticate,
  requirePermissions(['programs.read']),
  asyncHandler(patientController.getPatientPrograms)
);

router.post(
  '/patients/:id/programs/:programId/enroll',
  authenticate,
  requirePermissions(['programs.enroll']),
  asyncHandler(patientController.enrollPatientInProgram)
);

router.post(
  '/patients/:id/programs/:programId/unenroll',
  authenticate,
  requirePermissions(['programs.unenroll']),
  asyncHandler(patientController.unenrollPatientFromProgram)
);

// Patient flags routes
router.get(
  '/patients/:id/flags',
  authenticate,
  requirePermissions(['patients.read']),
  asyncHandler(patientController.getPatientFlags)
);

router.post(
  '/patients/:id/flags',
  authenticate,
  requirePermissions(['patients.flag']),
  asyncHandler(patientController.addPatientFlag)
);

router.delete(
  '/patients/:id/flags/:flagId',
  authenticate,
  requirePermissions(['patients.flag']),
  asyncHandler(patientController.removePatientFlag)
);

// Patient statistics routes
router.get(
  '/patients/statistics/overview',
  authenticate,
  requirePermissions(['statistics.read']),
  asyncHandler(patientController.getPatientStatistics)
);

router.get(
  '/patients/statistics/demographics',
  authenticate,
  requirePermissions(['statistics.read']),
  asyncHandler(patientController.getDemographicStatistics)
);

// Bulk operations
router.post(
  '/patients/bulk-import',
  authenticate,
  requirePermissions(['patients.bulk_import']),
  asyncHandler(patientController.bulkImportPatients)
);

router.post(
  '/patients/bulk-export',
  authenticate,
  requirePermissions(['patients.export']),
  asyncHandler(patientController.bulkExportPatients)
);

// Patient data validation
router.post(
  '/patients/validate',
  authenticate,
  requirePermissions(['patients.validate']),
  asyncHandler(patientController.validatePatientDataEndpoint)
);

export default router;