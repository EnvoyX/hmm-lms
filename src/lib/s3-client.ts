// lib/s3-client.ts
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

const s3Client = new S3Client({
  endpoint: env.DO_SPACES_ENDPOINT,
  region: env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: env.DO_SPACES_KEY,
    secretAccessKey: env.DO_SPACES_SECRET,
  },
});

export default s3Client;
