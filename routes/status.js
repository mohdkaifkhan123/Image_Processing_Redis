const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

router.get('/status/:requestId', async (req, res) => {
  const { requestId } = req.params;
  try {
    const job = await Job.findById(requestId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({
      requestId: job._id,
      status: job.status,
      inputImageUrls: job.inputImageUrls,
      outputImageUrls: job.outputImageUrls
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
