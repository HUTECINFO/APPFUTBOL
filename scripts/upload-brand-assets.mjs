import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = "brand-assets";

if (!url || !serviceKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY).");
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const bucketOptions = {
  public: true,
  fileSizeLimit: "5MB",
  allowedMimeTypes: ["image/png"],
};

const { data: existingBucket, error: bucketLookupError } = await supabase.storage.getBucket(bucket);
if (bucketLookupError && !/not found/i.test(bucketLookupError.message)) throw bucketLookupError;

if (!existingBucket) {
  const { error } = await supabase.storage.createBucket(bucket, bucketOptions);
  if (error && !/already exists/i.test(error.message)) throw error;
} else if (!existingBucket.public) {
  const { error } = await supabase.storage.updateBucket(bucket, bucketOptions);
  if (error) throw error;
}

const assets = [
  { localPath: "public/Diseño sin título (2).png", remotePath: "club-one-logo.png" },
  { localPath: "public/favicon.png", remotePath: "favicon.png" },
];

for (const asset of assets) {
  const file = await readFile(asset.localPath);
  const { error } = await supabase.storage.from(bucket).upload(asset.remotePath, file, {
    contentType: "image/png",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(asset.remotePath);
  console.log(data.publicUrl);
}
