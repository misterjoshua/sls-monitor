import * as rollup from 'rollup';

export async function rollupInputOptions(
  opt: rollup.InputOptions
): Promise<rollup.InputOptions> {
  opt.external = [].concat(opt.external, [
    'aws-sdk',
    'aws-xray-sdk',
    'aws-xray',
    'dynogels',
    'joi',
    'request',
  ]);

  return opt;
}

export async function rollupOutputOptions(
  opt: rollup.OutputOptions
): Promise<rollup.OutputOptions> {
  return opt;
}

export async function entriesGlob(): Promise<string> {
  return 'src/**/lambda.ts';
}

export async function jest(opt: jest.InitialOptions): Promise<jest.InitialOptions> {
  opt.roots = [
    "<rootDir>/cdk",
    "<rootDir>/src",
  ];

  return opt;
}

export async function eslintPatterns(): Promise<string[]> {
  return [
    "./cdk/**/*.ts",
    "./src/**/*.ts",
  ];
}
