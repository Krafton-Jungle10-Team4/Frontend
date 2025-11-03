import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div>{value}</div>
      </CardContent>
    </Card>
  );
}
