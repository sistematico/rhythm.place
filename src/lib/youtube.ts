import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
}

export class YouTubeDownloader {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'downloads');
    this.ensureOutputDir();
  }

  private async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const { stdout } = await execAsync(
        `yt-dlp --dump-json --no-warnings "${url}"`,
        { maxBuffer: 1024 * 1024 * 10 }
      );
      
      const info = JSON.parse(stdout);
      return {
        title: info.title,
        duration: info.duration,
        thumbnail: info.thumbnail,
      };
    } catch (error) {
      throw new Error(`Failed to get video info: ${error}`);
    }
  }

  async downloadAudio(url: string, fileName?: string): Promise<string> {
    const safeFileName = fileName || `audio_${Date.now()}`;
    const outputPath = path.join(this.outputDir, `${safeFileName}.mp3`);

    try {
      // yt-dlp com opções para extrair apenas áudio em mp3
      const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;
      
      await execAsync(command, { maxBuffer: 1024 * 1024 * 50 });
      
      return outputPath;
    } catch (error) {
      throw new Error(`Download failed: ${error}`);
    }
  }

  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .replace(/-+/g, '-') // Remove múltiplos hífens
      .substring(0, 100); // Limita o tamanho do nome
  }
}