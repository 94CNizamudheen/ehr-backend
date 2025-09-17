import { Router } from 'express'
import * as ctrl from '../controllers/patientController'


const router = Router()
router.get('/',  ctrl.listPatients)
router.post('/',  ctrl.createPatient)
router.get("/search", ctrl.searchPatients);
router.get('/:id',  ctrl.getPatient)
router.put('/:id',  ctrl.updatePatient)
router.delete('/:id',ctrl.deletePatient)
router.get("/history/:patientId", ctrl.getPatientHistory);

export default router
