const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const Job = require('../models/Job');
const imageQueue = require('../queues/imageQueue');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;

  const jobs = [];
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      const { 'Product Name': productName, 'Input Image Urls': inputImageUrls } = row;
      const urls = inputImageUrls.split(',');

      const newJob = new Job({
        productName,
        inputImageUrls: urls,
        status: 'Pending',
      });

      jobs.push(newJob);
    })
    .on('end', async () => {
      const savedJobs = await Job.insertMany(jobs);
      savedJobs.forEach(job => {
        imageQueue.add({ jobId: job._id, inputImageUrls: job.inputImageUrls });
      });
      res.json({ requestId: savedJobs[0]._id, status: 'Pending' });
    });
});

module.exports = router;
