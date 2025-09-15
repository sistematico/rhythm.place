import { mkdir, rm } from "node:fs/promises";
import path from 'node:path';
import NodeID3 from 'node-id3';
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

const YT_DLP = process.env.YT_DLP_PATH || "/usr/local/bin/yt-dlp";

export interface VideoInfo {
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  description: string;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

// Criar diretório de downloads se não existir
const ensureDownloadsDir = async (): Promise<void> => {
  try {
    await mkdir(DOWNLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating downloads directory:', error);
  }
};

// Sanitizar nome do arquivo
export const sanitizeFileName = (fileName: string): string => 
  fileName
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-')
    .substring(0, 100);

// Obter informações do vídeo usando yt-dlp
export const getVideoInfo = async (url: string): Promise<VideoInfo | null> => {
  try {
    const output = await ytdlp.downloadAsync(
      url,
      {
        onProgress: (progress) => {
          console.log(progress);
        },
        
      }
    );

    //const output = await new Response(proc.stdout).text();
    //const errorOutput = await new Response(proc.stderr).text();

    try {
      const info = JSON.parse(output);
      
      return {
        title: info.title || 'Unknown Title',
        author: info.uploader || info.channel || 'Unknown Artist',
        duration: info.duration || 0,
        thumbnail: info.thumbnail || '',
        description: info.description || '',
      };
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Output was:', output.substring(0, 200));
      return null;
    }
  } catch (error) {
    console.error('Error getting video info:', error);
    return null;
  }
};

// Baixar thumbnail
const downloadThumbnail = async (thumbnailUrl: string, outputPath: string): Promise<boolean> => {
  try {
    if (!thumbnailUrl) return false;
    
    const response = await fetch(thumbnailUrl);
    if (!response.ok) return false;
    
    const buffer = await response.arrayBuffer();
    await Bun.write(outputPath, buffer);
    return true;
  } catch (error) {
    console.error('Error downloading thumbnail:', error);
    return false;
  }
};

// Adicionar tags ID3 ao arquivo MP3
const addID3Tags = async (
  filePath: string, 
  videoInfo: VideoInfo,
  thumbnailPath?: string
): Promise<boolean> => {
  try {
    const tags: NodeID3.Tags = {
      title: videoInfo.title,
      artist: videoInfo.author,
      album: 'YouTube Downloads',
      comment: {
        language: 'eng',
        text: videoInfo.description.substring(0, 500),
      },
    };

    // Adicionar artwork se thumbnail foi baixada
    if (thumbnailPath) {
      try {
        const imageFile = Bun.file(thumbnailPath);
        const imageBuffer = await imageFile.arrayBuffer();
        tags.image = {
          mime: 'image/jpeg',
          type: {
            id: 3,
            name: 'Front Cover',
          },
          description: 'Cover',
          imageBuffer: Buffer.from(imageBuffer),
        };
      } catch (imgError) {
        console.error('Error adding image:', imgError);
      }
    }

    const result = NodeID3.write(tags, filePath);
    
    // Limpar arquivo temporário de thumbnail
    if (thumbnailPath) {
      try {
        // await $`rm -f ${thumbnailPath}`.quiet();
        await rm(thumbnailPath, { recursive: true, force: true });
      } catch {}
    }
    
    return result === true;
  } catch (error) {
    console.error('Error adding ID3 tags:', error);
    return false;
  }
};

// Função principal de download
export const downloadAudioWithMetadata = async (
  url: string,
  customFileName?: string
): Promise<DownloadResult> => {
  try {
    await ensureDownloadsDir();
    
    // Obter informações do vídeo
    const videoInfo = await getVideoInfo(url);
    if (!videoInfo) {
      return { success: false, error: 'Failed to get video information' };
    }

    // Preparar nome do arquivo
    const fileName = customFileName || sanitizeFileName(videoInfo.title);
    const outputPath = path.join(DOWNLOADS_DIR, `${fileName}.mp3`);
    const tempThumbnailPath = path.join(DOWNLOADS_DIR, `${fileName}_thumb.jpg`);

    // Baixar áudio usando yt-dlp com Bun.spawn
    const proc = Bun.spawn([
      YT_DLP,
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outputPath,
      url
    ], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    await proc.exited;
    
    if (proc.exitCode !== 0) {
      const errorOutput = await new Response(proc.stderr).text();
      console.error('Download failed:', errorOutput);
      return { success: false, error: 'Failed to download audio' };
    }

    // Verificar se o arquivo foi criado
    const file = Bun.file(outputPath);
    if (!(await file.exists())) {
      return { success: false, error: 'Output file was not created' };
    }

    // Baixar thumbnail
    const thumbnailDownloaded = await downloadThumbnail(
      videoInfo.thumbnail,
      tempThumbnailPath
    );

    // Adicionar tags ID3
    await addID3Tags(
      outputPath,
      videoInfo,
      thumbnailDownloaded ? tempThumbnailPath : undefined
    );

    return { success: true, filePath: outputPath };
  } catch (error) {
    console.error('Download error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Validar URL do YouTube
export const isValidYouTubeUrl = (url: string): boolean => {
  const patterns = [
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/,
  ];
  
  return patterns.some(pattern => pattern.test(url));
};

// Listar arquivos baixados
export const listDownloadedFiles = async (): Promise<string[]> => {
  try {
    await ensureDownloadsDir();
    const proc = Bun.spawn(['ls', '-1', DOWNLOADS_DIR], {
      stdout: 'pipe',
    });
    
    const output = await new Response(proc.stdout).text();
    return output
      .split('\n')
      .filter(file => file.endsWith('.mp3'))
      .map(file => path.join(DOWNLOADS_DIR, file));
  } catch {
    return [];
  }
};

// Obter tamanho do arquivo
export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const file = Bun.file(filePath);
    return file.size;
  } catch {
    return 0;
  }
};