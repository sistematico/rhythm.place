import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { downloads } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  downloadAudioWithMetadata,
  getVideoInfo,
  isValidYouTubeUrl
} from '@/lib/youtube';
import path from 'path';

// Verificar se yt-dlp está instalado ao iniciar
const verifyDependencies = async (): Promise<{ success: boolean; error?: string }> => {
  // const ytDlpInstalled = await checkYtDlpInstalled();
  
  // if (!ytDlpInstalled) {
  //   return {
  //     success: false,
  //     error: 'yt-dlp is not installed. Please install it first: https://github.com/yt-dlp/yt-dlp#installation'
  //   };
  // }
  
  return { success: true };
};

// Processar download em background
const processDownloadAsync = async (downloadId: number, url: string): Promise<void> => {
  try {
    // Obter informações do vídeo
    const videoInfo = await getVideoInfo(url);
    
    if (!videoInfo) {
      throw new Error('Could not fetch video information. Check if the URL is valid and yt-dlp is working.');
    }

    // Atualizar banco com informações do vídeo
    await db.update(downloads)
      .set({
        videoTitle: videoInfo.title,
        videoAuthor: videoInfo.author,
        videoThumbnail: videoInfo.thumbnail,
      })
      .where(eq(downloads.id, downloadId));

    // Baixar áudio com metadata
    const result = await downloadAudioWithMetadata(url);

    if (result.success) {
      await db.update(downloads)
        .set({
          status: 'completed',
          fileName: result.filePath,
          completedAt: new Date(),
        })
        .where(eq(downloads.id, downloadId));
    } else {
      throw new Error(result.error || 'Download failed');
    }
  } catch (error) {
    console.error('Process download error:', error);
    await db.update(downloads)
      .set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(downloads.id, downloadId));
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Criar registro no banco
    const [download] = await db.insert(downloads).values({
      videoUrl: url,
      status: 'processing',
    }).returning();

    // Processar download sem bloquear a resposta
    processDownloadAsync(download.id, url);

    return NextResponse.json({
      success: true,
      downloadId: download.id,
      message: 'Download started',
    });
  } catch (error) {
    console.error('Error initiating download:', error);
    return NextResponse.json(
      { error: 'Failed to start download' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadId = searchParams.get('id');
    const fileName = searchParams.get('file');

    // Servir arquivo se solicitado
    if (fileName) {
      try {
        const file = Bun.file(fileName);
        if (!(await file.exists())) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const stream = file.stream();
        
        return new Response(stream, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="${path.basename(fileName)}"`,
            'Content-Length': file.size.toString(),
          },
        });
      } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
      }
    }

    // Buscar download específico
    if (downloadId) {
      const [download] = await db.select()
        .from(downloads)
        .where(eq(downloads.id, parseInt(downloadId)));
      
      if (!download) {
        return NextResponse.json(
          { error: 'Download not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(download);
    }

    // Retornar todos os downloads
    const allDownloads = await db.select()
      .from(downloads)
      .orderBy(downloads.createdAt);
    
    return NextResponse.json(allDownloads);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}