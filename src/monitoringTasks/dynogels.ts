import * as dynogels from 'dynogels';
import { Item, DocumentCollection, Document } from 'dynogels';
import * as Joi from 'joi';
import * as util from 'util';
import { MonitoringTask } from '.';
import { getMonitoringTasksTable } from '../config';

export const MonitoringTaskModel = dynogels.define('MonitoringTask', {
  tableName: getMonitoringTasksTable(),

  hashKey: 'name',
  timestamps: true,

  schema: {
    name: Joi.string(),
    checkExpression: Joi.string(),
    url: Joi.string(),
  },
});

export const putMonitoringTask = util.promisify<MonitoringTask, Item>(
  MonitoringTaskModel.create
);

export const getMonitoringTasks = async (): Promise<MonitoringTask[]> => {
  const collection = await new Promise<DocumentCollection>(
    (resolve, reject) => {
      MonitoringTaskModel.scan().exec((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    }
  );

  return collection.Items.map((item: Document) => item.get() as MonitoringTask);
};

export const getMonitoringTask = util.promisify<string, Item>(
  MonitoringTaskModel.get
);
