"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { User, TokenResponse } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Diamond } from "lucide-react";

// The backend expects `username` and `password` via form-urlencoded data
const loginSchema = z.object({
  username: z.string().min(1, { message: "اسم المستخدم مطلوب" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setErrorMsg(null);
    try {
      // 1. Post to login using x-www-form-urlencoded
      const loginParams = new URLSearchParams();
      loginParams.append("username", values.username);
      loginParams.append("password", values.password);

      const loginRes = await api.post<TokenResponse>("/auth/login", loginParams, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = loginRes.data;

      // 2. Temporarily set the access token in state so we can fetch /users/me
      // Alternatively, we can just attach it to this specific request
      const userRes = await api.get<User>("/users/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // 3. Populate AuthStore and redirect
      setAuth(userRes.data, access_token);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMsg("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else {
        setErrorMsg("حدث خطأ في الاتصال بالخادم");
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <Diamond className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">ألماسة للمجوهرات</CardTitle>
          <CardDescription className="text-muted-foreground">
            تسجيل الدخول للنظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control as any}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم المستخدم" className="text-start" {...field} dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="text-start" {...field} dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive-foreground text-sm rounded-md text-center">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" className="w-full text-primary-foreground font-bold text-lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "جاري التحقق..." : "دخول"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
