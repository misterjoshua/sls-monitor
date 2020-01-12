import { MonitoringTask } from '../monitoringTasks';
import { createDimensions } from './createDimensions';

const testTask: MonitoringTask = {
  name: 'test',
  url: 'http://www.example.com/',
  checkExpression: 'example',
};

it('should create a dimension including the task name', () => {
  expect(createDimensions(testTask)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        Name: 'TaskName',
        Value: testTask.name,
      }),
    ]),
  );
});
