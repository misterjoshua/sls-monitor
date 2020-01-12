import * as core from '@aws-cdk/core';
import * as s3assets from '@aws-cdk/aws-s3-assets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as fs from 'fs';
import * as childprocess from 'child_process';
import { ISynthesisSession } from '@aws-cdk/core';

interface NodeModulesProps {
  code: string;
}

class NodeModules extends core.Construct {
  readonly s3asset: s3assets.Asset;

  constructor(scope: core.Construct, id: string, props: NodeModulesProps) {
    super(scope, id);

    this.s3asset = new s3assets.Asset(this, 'CodeAsset', {
      path: props.code,
      exclude: ['*', '.*', '!package.json', '!package-lock.json'],
    });
  }

  synthesize(session: ISynthesisSession): void {
    const assetFullPath = path.join(
      session.assembly.outdir,
      this.s3asset.assetPath,
    );
    const nodeModulesFullPath = path.join(assetFullPath, 'nodejs');

    if (!fs.existsSync(nodeModulesFullPath)) {
      fs.mkdirSync(nodeModulesFullPath);
    }

    for (const file of ['package.json', 'package-lock.json']) {
      const src = path.join(assetFullPath, file);
      const dest = path.join(nodeModulesFullPath, file);
      fs.copyFileSync(src, dest);
    }

    childprocess.execSync('npm ci --only=prod --silent', {
      cwd: nodeModulesFullPath,
    });
  }
}

export class NodeModulesCode extends lambda.Code {
  isInline = false;

  static fromNodeModules(code: string): NodeModulesCode {
    return new NodeModulesCode(code);
  }

  constructor(public readonly code: string) {
    super();
  }

  bind(scope: core.Construct): lambda.CodeConfig {
    const nodeModules = new NodeModules(scope, 'NodeModules', {
      code: this.code,
    });

    return {
      s3Location: {
        bucketName: nodeModules.s3asset.s3BucketName,
        objectKey: nodeModules.s3asset.s3ObjectKey,
      },
    };
  }
}
