const amqp = require('amqplib');
const { Logger } = require('./logger.util');

/**
 * Resilient RabbitMQ Client Utility
 */
class RabbitMQClient {
  constructor(url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672') {
    this.url = url;
    this.connection = null;
    this.channel = null;
    this.logger = new Logger('RabbitMQClient');
    this.isConnected = false;
    this.reconnectTimeout = 5000;
  }

  async connect() {
    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.url}...`);
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      this.isConnected = true;
      this.logger.log('Successfully connected to RabbitMQ.');

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err.message);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Attempting reconnect in 5s...');
        this.isConnected = false;
        setTimeout(() => this.connect(), this.reconnectTimeout);
      });

      return this.channel;
    } catch (error) {
      this.logger.warn(`RabbitMQ not reachable (${error.message}). Will retry asynchronously.`);
      this.isConnected = false;
      setTimeout(() => this.connect(), this.reconnectTimeout);
      return null;
    }
  }

  async publish(exchange, routingKey, message) {
    const payload = Buffer.from(JSON.stringify(message));
    if (!this.isConnected || !this.channel) {
      this.logger.warn(`RabbitMQ offline: event to ${exchange}/${routingKey} buffered/skipped.`);
      return false;
    }
    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      this.channel.publish(exchange, routingKey, payload, { persistent: true });
      this.logger.log(`Published event to ${exchange}/${routingKey}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to publish event to ${exchange}/${routingKey}:`, err.message);
      return false;
    }
  }

  async subscribe(exchange, routingKey, queueName, onMessage) {
    if (!this.isConnected || !this.channel) {
      this.logger.warn(`RabbitMQ offline: cannot subscribe to ${exchange}/${routingKey} yet.`);
      return false;
    }
    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const q = await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(q.queue, exchange, routingKey);

      this.channel.consume(q.queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await onMessage(content);
            this.channel.ack(msg);
          } catch (handlerErr) {
            this.logger.error(`Error processing message from ${queueName}:`, handlerErr.message);
            this.channel.nack(msg, false, false); // discard or dead-letter
          }
        }
      });
      this.logger.log(`Subscribed to ${exchange}/${routingKey} on queue ${queueName}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to subscribe to ${exchange}:`, err.message);
      return false;
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.isConnected = false;
    } catch (err) {
      this.logger.error('Error closing RabbitMQ:', err.message);
    }
  }
}

module.exports = { RabbitMQClient };
