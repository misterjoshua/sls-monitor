import dynogels, { Item, DocumentCollection } from 'dynogels';
import Joi from 'joi';
import util from 'util';
import { MonitoringTask } from '.';

const MonitoringTasksTable = process.env.MonitoringTasksTable;

export const MonitoringTaskModel = dynogels.define('MonitoringTask', {
  tableName: MonitoringTasksTable,

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

  return collection.Items.map((item: Item) => item.get() as MonitoringTask);
};

export const getMonitoringTask = util.promisify<string, Item>(
  MonitoringTaskModel.get
);
