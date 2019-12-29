import { CommonCloudFormation } from '../aws';
import { PutStackTask } from './putStackTask';
type PutStackMode = 'create' | 'update' | 'recreate';
const getPutStackMode = async (stackName: string): Promise<PutStackMode> => {
  try {
    console.log('Looking up ', stackName);
    const stacks = await CommonCloudFormation.describeStacks({
      StackName: stackName,
    }).promise();
    console.log('stacks = ', stacks);
    if (stacks.Stacks.length < 1) {
      return 'create';
    }
    switch (stacks.Stacks[0].StackStatus) {
      case 'ROLLBACK_COMPLETE':
        return 'recreate';
      default:
        return 'update';
    }
  } catch (e) {
    return 'create';
  }
};

async function deleteStack(stackName: string): Promise<void> {
  await CommonCloudFormation.deleteStack({
    StackName: stackName,
  }).promise();
}

async function updateStack(
  stackName: string,
  templateBody: string
): Promise<string> {
  const res = await CommonCloudFormation.updateStack({
    StackName: stackName,
    TemplateBody: templateBody,
  }).promise();
  return res.StackId;
}

async function createStack(
  stackName: string,
  templateBody: string
): Promise<string> {
  const res = await CommonCloudFormation.createStack({
    StackName: stackName,
    TemplateBody: templateBody,
  }).promise();

  return res.StackId;
}

export const runPutStackTask = async (task: PutStackTask): Promise<void> => {
  const putStackMode = await getPutStackMode(task.stackName);

  if ('recreate' === putStackMode) {
    await deleteStack(task.stackName);
    throw new Error('Stack needs to be recreated.');
  } else if ('create' === putStackMode) {
    await createStack(task.stackName, task.templateBody);
  } else {
    await updateStack(task.stackName, task.templateBody);
  }
};
