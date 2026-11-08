import type { Transaction, FamilyMember } from '@/types';

// RFC 4180: 쉼표/따옴표/줄바꿈 포함 필드는 따옴표로 감싸고 내부 따옴표는 이중화
// CSV Injection 방지: =/+/-/@로 시작하면 엑셀이 수식으로 해석하므로 앞에 ' 붙여 무력화
function escapeField(value: string): string {
  if (/^[=+\-@]/.test(value)) value = `'${value}`;
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildTransactionsCsv(
  transactions: Transaction[],
  members: FamilyMember[],
): string {
  const memberName = (id?: string) => members.find(m => m.id === id)?.name ?? '';
  const header = 'Date,Type,Jar,Category,SubCategory,Amount,Note,Member';
  const rows = transactions.map(tx =>
    [
      tx.date,
      tx.type,
      tx.jar ?? '',
      tx.category ?? '',
      tx.subCategory,
      String(tx.amount),
      tx.note,
      memberName(tx.memberId),
    ].map(escapeField).join(','),
  );
  // BOM: 엑셀이 UTF-8(한국어/일본어)을 올바르게 인식하도록
  return '﻿' + [header, ...rows].join('\n');
}

export async function saveCsv(csv: string, fileName: string): Promise<void> {
  const { Capacitor } = await import('@capacitor/core');

  if (Capacitor.isNativePlatform()) {
    // 네이티브: 캐시에 저장 후 OS 공유 시트 (WebView는 blob 다운로드 미지원)
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ files: [uri] });
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
