import { Button } from '@shared/components/button';
import { Badge } from '@shared/components/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/components/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/dropdown-menu';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { APIKey } from '../api/apiKeyClient.ts';
import { useApiKeyStore } from '../stores/apiKeyStore.ts';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/alert-dialog';

interface APIKeyListProps {
  botId: string;
  keys: APIKey[];
  isLoading: boolean;
}

export function APIKeyList({ botId, keys, isLoading }: APIKeyListProps) {
  const { deleteApiKey } = useApiKeyStore();
  const [deleteTarget, setDeleteTarget] = useState<APIKey | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteApiKey(botId, deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error('API 키 삭제 실패:', error);
      alert('API 키 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        API 키 목록을 불러오는 중...
      </div>
    );
  }

  if (keys.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground mb-2">아직 API 키가 없습니다.</p>
        <p className="text-sm text-muted-foreground">
          새 API 키를 생성하여 워크플로우를 외부에서 실행하세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>API 키</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>Rate Limit</TableHead>
              <TableHead className="text-right">사용량 (이번 달)</TableHead>
              <TableHead className="text-right">마지막 사용</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{key.name}</div>
                    {key.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {key.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {key.key_preview}
                  </code>
                </TableCell>
                <TableCell>
                  {key.is_active ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      활성
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      비활성
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{key.rate_limits.per_minute}/분</div>
                    <div className="text-xs text-muted-foreground">
                      {key.rate_limits.per_hour}/시간
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm">
                    {key.usage_summary.requests_month.toLocaleString()} 요청
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {key.usage_summary.last_used_at
                    ? new Date(
                        key.usage_summary.last_used_at
                      ).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '사용 안 함'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          // TODO: Edit 기능 구현
                          alert('수정 기능은 추후 추가될 예정입니다.');
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(key)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>API 키 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> API 키를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

