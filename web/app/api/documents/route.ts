import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { userId, tenantId } = auth.user;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const type = searchParams.get('type') ?? undefined;
  const loadId = searchParams.get('loadId') ?? undefined;

  const docs = await prisma.document.findMany({
    where: {
      tenantId,
      userId,
      ...(status ? { status: status as never } : {}),
      ...(type ? { type: type as never } : {}),
      ...(loadId ? { loadId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: docs });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { userId, tenantId } = auth.user;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string | null;
  const loadId = (formData.get('loadId') as string | null) ?? undefined;

  if (!file || !type) {
    return NextResponse.json({ success: false, error: 'file and type are required' }, { status: 400 });
  }

  const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Only PDF, JPG, or PNG files are accepted' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 });
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'docs');
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split('.').pop() ?? 'pdf';
  const safeName = `${Date.now()}_${userId.slice(-6)}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, safeName), Buffer.from(bytes));

  const doc = await prisma.document.create({
    data: {
      tenantId,
      userId,
      loadId,
      type: type as never,
      status: 'PENDING',
      fileUrl: `/uploads/docs/${safeName}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    },
  });

  return NextResponse.json({ success: true, data: doc }, { status: 201 });
}
