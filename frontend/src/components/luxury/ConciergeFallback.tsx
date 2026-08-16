import { MessageCircle } from "lucide-react";

export function ConciergeFallback() {
  return (
    <div className="w-full py-32 flex flex-col items-center justify-center gap-8 text-center px-4 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
        <MessageCircle className="w-6 h-6 text-primary" />
      </div>
      
      <div className="space-y-4">
        <h3 className="font-display text-3xl text-foreground">خدمة الكونسيرج</h3>
        <p className="font-sans text-lg text-muted-foreground leading-relaxed">
          نعمل حالياً على تحديث مجموعاتنا. يرجى التواصل مع خبرائنا للمساعدة الشخصية.
        </p>
      </div>

      <a 
        href="https://wa.me/201234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 px-8 py-4 bg-primary text-primary-foreground font-sans text-sm hover:bg-primary/90 transition-colors flex items-center gap-3 group"
      >
        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
        تواصل عبر واتساب
      </a>
    </div>
  );
}
