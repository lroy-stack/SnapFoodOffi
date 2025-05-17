import { supabase } from './supabaseClient';

/**
 * Servicio para gestionar operaciones de almacenamiento en Supabase
 */
class StorageService {
  
  /**
   * Obtiene un bucket disponible para almacenar contenido de usuario
   * @returns Un objeto con el nombre del bucket disponible y si es un fallback
   */
  public async getAvailableBucket() {
    try {
      // Intentar obtener la lista de buckets disponibles
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error al listar buckets:', error);
        return { name: 'uploads', isFallback: true };
      }
      
      if (!buckets || buckets.length === 0) {
        console.warn('No se encontraron buckets en Supabase');
        return { name: 'uploads', isFallback: true };
      }
      
      // Buscar buckets con nombres comunes para almacenamiento de usuario
      const preferredBuckets = ['user_content', 'uploads', 'avatars', 'profiles', 'public'];
      
      // Intentar encontrar un bucket preferido
      for (const preferred of preferredBuckets) {
        const bucket = buckets.find(b => b.name.toLowerCase() === preferred);
        if (bucket) {
          console.log(`Usando bucket: ${bucket.name}`);
          return { name: bucket.name, isFallback: false };
        }
      }
      
      // Si no encontramos uno preferido, usar el primero disponible
      console.log(`Usando bucket disponible: ${buckets[0].name}`);
      return { name: buckets[0].name, isFallback: false };
    } catch (error) {
      console.error('Error al obtener bucket disponible:', error);
      return { name: 'uploads', isFallback: true };
    }
  }
  
  /**
   * Sube un archivo al almacenamiento
   * @param file Archivo a subir
   * @param path Ruta donde guardar (sin el nombre del archivo)
   * @param fileName Nombre de archivo personalizado (opcional)
   * @returns URL pública del archivo o null si falla
   */
  public async uploadFile(
    file: File, 
    path: string = 'public',
    fileName?: string
  ): Promise<string | null> {
    if (!file) return null;
    
    try {
      // Obtener un bucket disponible
      const { name: bucketName, isFallback } = await this.getAvailableBucket();
      
      if (isFallback) {
        console.warn(`Usando bucket fallback '${bucketName}'. Puede que la operación falle si no existe.`);
      }
      
      // Crear nombre único para el archivo si no se proporciona uno
      const finalFileName = fileName || this.generateUniqueFileName(file);
      const fullPath = path ? `${path}/${finalFileName}` : finalFileName;
      
      console.log(`Intentando subir archivo a ${bucketName}/${fullPath}`);
      
      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        
        // Si el error es de bucket no encontrado y estamos usando un bucket que no es fallback,
        // intentar con el bucket de fallback
        if (!isFallback && uploadError.message?.includes('bucket') && uploadError.message?.includes('not found')) {
          console.log('Intentando con bucket de fallback "uploads"...');
          return this.uploadWithFallbackBucket(file, path, finalFileName);
        }
        
        throw uploadError;
      }
      
      // Obtener URL pública
      const { data } = supabase.storage.from(bucketName).getPublicUrl(fullPath);
      
      if (!data?.publicUrl) {
        throw new Error('No se pudo obtener URL pública para el archivo');
      }
      
      console.log('Archivo subido exitosamente:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error en uploadFile:', error);
      return null;
    }
  }
  
  /**
   * Intenta subir con un bucket alternativo como último recurso
   */
  private async uploadWithFallbackBucket(
    file: File, 
    path: string = 'public',
    fileName: string
  ): Promise<string | null> {
    try {
      // Intentar crear el bucket si no existe
      try {
        await supabase.storage.createBucket('uploads', {
          public: true
        });
        console.log('Bucket "uploads" creado con éxito');
      } catch (createError) {
        console.warn('No se pudo crear el bucket:', createError);
        // Continuar incluso si falla la creación, puede que ya exista
      }
      
      const fullPath = path ? `${path}/${fileName}` : fileName;
      
      // Intentar subir al bucket de fallback
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error al subir con bucket fallback:', uploadError);
        throw uploadError;
      }
      
      // Obtener URL pública
      const { data } = supabase.storage.from('uploads').getPublicUrl(fullPath);
      
      if (!data?.publicUrl) {
        throw new Error('No se pudo obtener URL pública para el archivo');
      }
      
      console.log('Archivo subido con bucket fallback:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error en uploadWithFallbackBucket:', error);
      return null;
    }
  }
  
  /**
   * Genera un nombre de archivo único
   */
  private generateUniqueFileName(file: File): string {
    const fileExt = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `file_${timestamp}_${random}.${fileExt}`;
  }
  
  /**
   * Sube una imagen de perfil 
   * @param userId ID del usuario
   * @param file Archivo de imagen
   * @returns URL pública de la imagen o null si falla
   */
  public async uploadProfileImage(userId: string, file: File): Promise<string | null> {
    if (!file) return null;
    
    // Validar tipo y tamaño
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      console.error('Tipo de archivo inválido:', file.type);
      return null;
    }
    
    if (file.size > maxSize) {
      console.error('Archivo demasiado grande:', file.size);
      return null;
    }
    
    // Generar nombre único para la imagen de perfil
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `profile_${userId}_${Date.now()}.${fileExt}`;
    
    // Subir imagen a la carpeta avatars
    return this.uploadFile(file, 'avatars', fileName);
  }
}

// Exportar una única instancia
export const storageService = new StorageService();
export default storageService;
