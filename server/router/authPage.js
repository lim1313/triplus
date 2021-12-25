const express = require('express');
const router = express.Router();
const controller = require('./../controller/oauth');

router.get('/google', controller.google);
router.post('/googlecallback', controller.googlecallback);
router.get('/kakao', controller.kakao);
router.post('/kakaocallback', controller.kakaocallback);

module.exports = router;
