const Bull = require('bull');
const axios = require('axios');
const sharp = require('sharp');
const Job = require('../models/Job');
const imageQueue = new Bull('image-processing', { redis: { port: 6379, host: '127.0.0.1' } });

imageQueue.process(async (job) => {
  const { jobId, inputImageUrls } = job.data;

  const outputUrls = [];

  for (const url of inputImageUrls) {
    try {
      const response = await axios({
        url,
        responseType: 'arraybuffer'
      });
      const compressedImage = await sharp(response.data)
        .jpeg({ quality: 50 })
        .toBuffer();
      const outputUrl = `compressed_${url.split('/').pop()}`;
      outputUrls.push(outputUrl);
    } catch (error) {
      console.error(`Failed to process ${url}: `, error);
    }
  }

  await Job.findByIdAndUpdate(jobId, {
    status: 'Completed',
    outputImageUrls: outputUrls,
    updatedAt: Date.now(),
  });
});

module.exports = imageQueue;
