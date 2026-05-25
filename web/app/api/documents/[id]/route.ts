import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { userId, tenantId } = auth.user;
  const { id } = await params;

  const doc = await prisma.document.findFirst({
    where: { id, tenantId, userId },
  });
  if (!doc) {
    return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
  }

  if (doc.status === 'VERIFIED') {
    return NextResponse.json(
      { success: false, error: 'Verified documents cannot be deleted' },
      { status: 403 },
    );
  }

  // Remove file from disk (best effort)
  try {
    const filePath = join(process.cwd(), 'public', doc.fileUrl);
    await unlink(filePath);
  } catch {
    // File may already be missing — not fatal
  }

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
