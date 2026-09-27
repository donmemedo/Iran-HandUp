import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "system-ui", background: "#0a0910", color: "#f6f2f4", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 64, margin: 0 }}>۴۰۴</h1>
          <p style={{ opacity: 0.7 }}>صفحه‌ای که دنبالش بودید پیدا نشد.</p>
          <Link href="/fa" style={{ color: "#ff5c38", fontWeight: 700 }}>بازگشت به خانه</Link>
        </div>
      </body>
    </html>
  );
}
