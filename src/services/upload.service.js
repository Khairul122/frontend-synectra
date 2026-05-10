import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON, STORAGE_BUCKET } from '../constants/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export const uploadService = {
  async uploadImage(file) {
    const ext      = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    return data.publicUrl;
  },

  async deleteImage(url) {
    const filename = url.split('/').pop();
    await supabase.storage.from(STORAGE_BUCKET).remove([filename]);
  },
};
