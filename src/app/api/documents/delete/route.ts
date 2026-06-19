// app/api/upload/delete/route.ts
import { NextResponse } from "next/server";
import s3Client from "~/lib/s3-client";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function DELETE(request: Request) {
  try {
    const { prefix } = (await request.json()) as {prefix: string}; // e.g., "tryout/123/"
    
    // List all objects under the prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.DO_SPACES_BUCKET,
      Prefix: prefix,
    });
    
    const listedObjects = await s3Client.send(listCommand);
    
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return NextResponse.json({ message: "No files to delete" });
    }
    
    // Delete all objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
      },
    });
    
    await s3Client.send(deleteCommand);
    
    return NextResponse.json({ 
      message: "Folder deleted successfully",
      deletedCount: listedObjects.Contents.length 
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
