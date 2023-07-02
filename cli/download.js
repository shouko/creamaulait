const { v4: uuidv4 } = require('uuid');

const { TransportStreamConsumer } = require('../consumer/transportStream');
const { TransportStreamProducer } = require('../producer');

async function main(argv) {
  const [url, maxSegmentSize] = argv;
  const id = uuidv4();
  const producer = new TransportStreamProducer(url);
  const segmentConsumer = new TransportStreamConsumer(
    id,
    parseInt(maxSegmentSize || 100 * 1024 * 1024, 10),
    producer.emitter,
  );
  const combinedConsumer = new TransportStreamConsumer(
    id,
    0,
    producer.emitter,
  );
  await segmentConsumer.ready();
  await combinedConsumer.ready();
  await producer.start();
}

const [, , ...rest] = process.argv;
main(rest);
