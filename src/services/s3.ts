import { S3Client, ListObjectsV2Command, type S3ClientConfig } from "@aws-sdk/client-s3";

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

let s3Client: S3Client | null = null;

export const initializeS3 = (config: S3Config) => {
  const s3Config: S3ClientConfig = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  };
  s3Client = new S3Client(s3Config);
};

export const listS3Objects = async (bucketName: string, prefix: string = "") => {
  if (!s3Client) {
    throw new Error("S3 Client not initialized");
  }

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    throw error;
  }
};
