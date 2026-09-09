const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const publicBrandAssetsUrl = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public/brand-assets`
  : null;

/** URLs públicas de los recursos de marca hospedados en Supabase Storage. */
export const CLUB_ONE_LOGO_URL = publicBrandAssetsUrl
  ? `${publicBrandAssetsUrl}/club-one-logo.png`
  : "/icon.svg";

export const CLUB_ONE_FAVICON_URL = publicBrandAssetsUrl
  ? `${publicBrandAssetsUrl}/favicon.png`
  : "/favicon.png";
