const express = require('express');
const router = express.Router();
const { generateQRToken, scanQRToken } = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorize('Faculty'), generateQRToken);
router.post('/scan', protect, authorize('Student'), scanQRToken);

module.exports = router;
