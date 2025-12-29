import { Job, Queue, Worker } from "bullmq";
import winston from "winston";

import { CoreInterface } from "../../types.js";

export class MessageBroker {
  private log: winston.Logger;
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private redis: any;
  constructor(Core: CoreInterface) {
    this.log = Core.logger as winston.Logger;
    this.redis = Core.redis;
    this.queues = new Map<string, Queue>();
    this.workers = new Map<string, Worker>();
  }

  private getQueue(queueName: string): Queue {
    try {
      if (!this.queues.has(queueName)) {
        this.queues.set(
          queueName,
          new Queue(queueName, {
            connection: this.redis,
          })
        );
      }
      return this.queues.get(queueName)!;
    } catch (err: any) {
      this.log.error(`MessageBroker :: getQueue : ${err}`);
      throw err;
    }
  }

  /**
   * Pushes the job into the queue with name `queueName`. Creates the queue, if it does not already exist.
   * @param queueName name of the queue to push the job into
   * @param jobName name of the job to be pushed
   * @param data job data
   * @param options queue options
   */
  async pushJob(
    queueName: string,
    jobName: string,
    data: any,
    options?: {
      attempts?: number;
      delay?: number;
      backoff?: {
        type: "fixed" | "exponential";
        delay: number;
      };
    }
  ): Promise<void> {
    try {
      const queue = this.getQueue(queueName);
      queue.add(jobName, data, {
        attempts: options?.attempts || 3,
        delay: options?.delay,
        backoff: options?.backoff || {
          type: "exponential",
          delay: 2000,
        },
      });
    } catch (err) {
      this.log.error(`MessageBroker :: pushJob : ${err}`);
      throw err;
    }
  }

  /**
   * Create a worker for a specific queue
   * @param queueName name of the queue to process jobs from
   * @param processor function to be executed for each job
   * @param options worker option
   * @returns Worker instance
   */
  createWorker(
    queueName: string,
    processor: (job: Job) => Promise<void>,
    options?: { concurrency?: number }
  ): Worker {
    try {
      if (this.workers.has(queueName)) {
        this.log.warn(
          `MessageBroker :: createWorker : Worker already exists for queue ${queueName}. Returning existing worker.`
        );
        return this.workers.get(queueName)!;
      }
      const worker = new Worker(
        queueName,
        async (job: Job) => {
          try {
            await processor(job);
          } catch (err) {}
        },
        {
          connection: this.redis,
          concurrency: options?.concurrency || 1,
        }
      );

      worker.on("completed", (job) => {
        this.log.info(
          `MessageBroker :: createWorker : Job ${job.id} completed in queue ${queueName}`
        );
      });

      worker.on("failed", (job, err) => {
        throw new Error(
          `Job ${job?.id} failed in queue ${queueName} with error: ${err}`
        );
      });

      this.workers.set(queueName, worker);
      return worker;
    } catch (err) {
      this.log.error(`MessageBroker :: createWorker : ${err}`);
      throw err;
    }
  }

  /**
   * Close all workers and queues
   */
  async close(): Promise<void> {
    try {
      // Close all workers first
      const workerPromises = Array.from(this.workers.values()).map((worker) =>
        worker.close()
      );
      await Promise.all(workerPromises);
      this.workers.clear();

      // Close all queues
      const queuePromises = Array.from(this.queues.values()).map((queue) =>
        queue.close()
      );
      await Promise.all(queuePromises);
      this.queues.clear();
    } catch (err) {
      this.log.error(`MessageBroker :: close : ${err}`);
      throw err;
    }
  }
}
