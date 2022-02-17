const amqp = require("amqplib");

class AMQPReply {
  constructor(qName) {
    console.log("run ok");
    this.qName = qName;
    this.uri = [
      "amqp://",
      "admin",
      ":",
      "admin123",
      "@",
      "localhost",
      ":",
      "5672",
    ].join("");
  }

  initialize() {
    return amqp
      .connect(this.uri)
      .then((conn) => conn.createChannel())
      .then((channel) => {
        this.channel = channel;
        console.log("init ok");
        return this.channel.assertQueue(this.qName);
      })
      .then((q) => {
        return (this.queue = "crisis_alert.add_keyword");
      })
      .catch((err) => console.log(err.stack));
  }

  handleRequest(handler) {
    return this.channel.consume(this.queue, (msg) => {
      const content = JSON.parse(msg.content.toString());
      handler(content, (reply) => {
        console.log("handle done");
        this.channel.ack(msg);
      });
    });
  }
}

const worker = new AMQPReply();
const handle = worker.initialize().then((res) =>
  worker.handleRequest((content, reply) => {
    console.log("content", content);
    reply();
    return true;
  })
);
// handle({ content: "congdat" });
// module.exports = (excName, qName, pattern) => {
