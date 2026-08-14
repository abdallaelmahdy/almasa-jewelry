export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">لوحة القيادة</h2>
        <p className="text-muted-foreground">
          أهلاً بك في نظام ألماسة للمجوهرات. لقد تم تسجيل دخولك بنجاح.
        </p>
      </div>
      
      {/* Dashboard widgets will go here in future steps */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholders for visual testing */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">إجمالي المبيعات اليوم</h3>
          <div className="text-2xl font-bold">---</div>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">عدد الفواتير</h3>
          <div className="text-2xl font-bold">---</div>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">سعر الذهب (21)</h3>
          <div className="text-2xl font-bold">---</div>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">حالة النظام</h3>
          <div className="text-2xl font-bold text-primary">متصل</div>
        </div>
      </div>
    </div>
  );
}
