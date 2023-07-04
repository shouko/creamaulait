const { v4: uuidv4 } = require('uuid');

const { TransportStreamSaver } = require('../workers/transportStreamSaver');
const { TransportStreamProducer } = require('../workers/transportStreamProducer');
const { MetadataSaver } = require('../workers/metadataSaver');

async function main(argv) {
  const [url, maxSegmentSize] = argv;
  const id = uuidv4();
  const producer = new TransportStreamProducer(url);
  const metadataSaver = new MetadataSaver(
    id,
    producer.emitter,
  );
  const segmentedSaver = new TransportStreamSaver(
    id,
    parseInt(maxSegmentSize || 100 * 1024 * 1024, 10),
    producer.emitter,
  );
  const combinedSaver = new TransportStreamSaver(
    id,
    0,
    producer.emitter,
  );
  await Promise.all([
    metadataSaver.start(),
    segmentedSaver.start(),
    combinedSaver.start(),
  ]);
  await producer.start();
}

const [, , ...rest] = process.argv;
main(rest);
