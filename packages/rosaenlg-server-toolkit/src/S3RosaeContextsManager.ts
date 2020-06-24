import aws = require('aws-sdk');
import { RosaeContextsManager, RosaeContextsManagerParams, UserAndTemplateId } from './RosaeContextsManager';
import { RosaeNlgFeatures } from 'rosaenlg-packager';

export interface S3Conf {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
}

export class S3RosaeContextsManager extends RosaeContextsManager {
  private s3: aws.S3;
  private bucket: string;

  private configureS3(s3Conf: S3Conf): void {
    const s3config: aws.S3.ClientConfiguration = {
      s3ForcePathStyle: true,
    };
    s3config.accessKeyId = s3Conf.accessKeyId;
    s3config.secretAccessKey = s3Conf.secretAccessKey;
    // when testing using s3rver
    if (s3Conf.endpoint) {
      s3config.endpoint = s3Conf.endpoint;
    }
    this.s3 = new aws.S3(s3config);
    this.bucket = s3Conf.bucket;

    console.info({
      action: 'configureS3',
      message: `bucket is ${this.bucket}`,
    });
  }

  constructor(
    s3Conf: S3Conf,
    rosaeNlgFeatures: RosaeNlgFeatures,
    rosaeContextsManagerParams: RosaeContextsManagerParams,
  ) {
    super(rosaeContextsManagerParams);
    this.configureS3(s3Conf);
    this.rosaeNlgFeatures = rosaeNlgFeatures;
  }

  public hasBackend(): boolean {
    return true;
  }

  public checkHealth(cb: (err: Error) => void): void {
    const filename = `health_${this.getKindOfUuid()}.tmp`;
    const content = 'health check';

    this.s3.upload(
      {
        Bucket: this.bucket,
        Key: filename,
        Body: content,
      },
      (err) => {
        if (err) {
          cb(err);
          return;
        } else {
          this.s3.deleteObject({ Bucket: this.bucket, Key: filename }, () => {
            cb(null);
            return;
          });
        }
      },
    );
  }

  public getFilename(user: string, templateId: string): string {
    return user + '/' + templateId + '.json';
  }

  protected getAllFiles(cb: (err: Error, files: string[]) => void): void {
    this.s3.listObjectsV2({ Bucket: this.bucket }, (err, data) => {
      if (err) {
        console.error({
          message: `s3 did not respond properly: ${err}`,
        });
        const e = new Error();
        e.message = `s3 did not respond properly: ${err}`;
        cb(err, null);
      } else {
        /* istanbul ignore if */
        if (data.IsTruncated) {
          console.error({
            message: `s3 response is truncated`,
          });
          const e = new Error();
          e.message = `s3 response is truncated`;
          cb(err, null);
        } else {
          const files: string[] = [];
          for (let i = 0; i < data.Contents.length; i++) {
            files.push(data.Contents[i].Key);
          }
          cb(null, files);
        }
      }
    });
  }

  public readTemplateOnBackend(user: string, templateId: string, cb: (err: Error, readContent: any) => void): void {
    const entryKey = this.getFilename(user, templateId);
    this.s3.getObject(
      {
        Bucket: this.bucket,
        Key: entryKey,
      },
      (s3err, data) => {
        if (s3err) {
          // does not exist: we don't care, don't even log
          const e = new Error();
          e.name = '404';
          e.message = `${entryKey} not found on s3: ${s3err.message}`;
          cb(e, null);
          return;
        } else {
          const rawTemplateData = data.Body.toString();
          let parsed: any;
          try {
            parsed = JSON.parse(rawTemplateData);
          } catch (parseErr) {
            const e = new Error();
            e.name = '400';
            e.message = `could not parse: ${parseErr}`;
            cb(e, null);
            return;
          }
          cb(null, parsed);
          return;
        }
      },
    );
  }

  protected getUserAndTemplateId(filename: string): UserAndTemplateId {
    return this.getUserAndTemplateIdHelper(filename, '/');
  }

  public saveOnBackend(filename: string, content: string, cb: (err: Error) => void): void {
    this.s3.upload(
      {
        Bucket: this.bucket,
        Key: filename,
        Body: content,
      },
      (err, _data) => {
        cb(err);
      },
    );
  }

  public deleteFromBackend(filename: string, cb: (err: Error) => void): void {
    this.s3.deleteObject(
      { Bucket: this.bucket, Key: filename },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (err: aws.AWSError, _data: aws.S3.DeleteObjectOutput) => {
        cb(err);
      },
    );
  }
}
