import { CommonCloudFormation } from '../aws';
import { PutStackTask } from './putStackTask';
import { getResourceUniqueString } from '../config';

type PutStackMode = 'create' | 'update' | 'recreate';

const fullStackName = (name: string): string =>
  `${getResourceUniqueString()}-${name}`;

const getPutStackMode = async (stackName: string): Promise<PutStackMode> => {
  try {
    console.debug('Looking up ', stackName);
    const stacks = await CommonCloudFormation.describeStacks({
      StackName: stackName,
    }).promise();

    console.debug('stacks = ', stacks);

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
): Promise<void> {
  try {
    await CommonCloudFormation.updateStack({
      StackName: stackName,
      TemplateBody: templateBody,
    }).promise();
  } catch (e) {
    if (/No updates/i.test(e.message)) {
      // We're going to get a remote fault no matter what with this approach, but the lambda won't fail.
      console.info('No updates required');
    } else {
      console.error('Exception: ', e);
      throw e;
    }
  }
}

async function createStack(
  stackName: string,
  templateBody: string
): Promise<void> {
  await CommonCloudFormation.createStack({
    StackName: stackName,
    TemplateBody: templateBody,
  }).promise();
}

export const runPutStackTask = async (task: PutStackTask): Promise<void> => {
  const stackName = fullStackName(task.stackName);
  const putStackMode = await getPutStackMode(stackName);

  if ('recreate' === putStackMode) {
    console.info(`Recreating ${stackName}`);
    await deleteStack(stackName);
    throw new Error('Stack needs to be recreated.');
  } else if ('create' === putStackMode) {
    console.info(`Creating ${stackName}`);
    await createStack(stackName, task.templateBody);
  } else {
    console.info(`Updating ${stackName}`);
    await updateStack(stackName, task.templateBody);
  }
};
