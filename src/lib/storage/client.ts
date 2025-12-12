import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type UploadParams = {
  key: string;
  contentType: string;
};

function getS3Client(): S3Client | null {
  const accessKeyId = process.env.STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_SECRET_KEY;
  const region = process.env.STORAGE_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    return null;
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getPublicUrl(key: string) {
  const bucket = process.env.STORAGE_BUCKET;
  const region = process.env.STORAGE_REGION;
  if (!bucket || !region) {
    throw new Error("Storage not configured. Set STORAGE_BUCKET and STORAGE_REGION.");
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function createSignedUploadUrl(params: UploadParams): Promise<string> {
  const bucket = process.env.STORAGE_BUCKET;
  const client = getS3Client();

  if (!bucket) {
    throw new Error("Storage not configured. Set STORAGE_BUCKET environment variable.");
  }

  if (!client) {
    throw new Error(
      "AWS S3 credentials not configured. Set STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, and STORAGE_REGION environment variables."
    );
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    // Generate signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create signed upload URL: ${errorMessage}`);
  }
}

