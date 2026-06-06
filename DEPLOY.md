# Деплой Fils Bonus

## 1. Supabase PostgreSQL

1. Создайте проект на [supabase.com](https://supabase.com).
2. Скопируйте `DATABASE_URL` из **Project Settings → Database → Connection string (URI)**.
3. Используйте pooled connection string для Vercel.

## 2. Переменные окружения

Создайте `.env` локально и те же переменные в Vercel:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=случайная_длинная_строка_32+_символов
ADMIN_EMAILS=info@filsdesign.ru
ADMIN_EMAIL=info@filsdesign.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
TILDA_WEBHOOK_SECRET=
```

`ADMIN_EMAILS` — список email через запятую. Эти пользователи получат `isAdmin=true` при регистрации.

## 3. Миграции

```bash
npm install
npx prisma migrate deploy
```

Локально для разработки:

```bash
npx prisma migrate dev
```

## 4. Vercel

1. Импортируйте репозиторий `come2me2/fillsbonus` в [vercel.com](https://vercel.com).
2. **Обязательно** добавьте переменные окружения в Vercel → **Settings → Environment Variables**.

   Для каждой переменной включите все окружения: **Production**, **Preview**, **Development**.

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=случайная_длинная_строка_32+_символов
ADMIN_EMAILS=info@filsdesign.ru
ADMIN_EMAIL=info@filsdesign.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
TILDA_WEBHOOK_SECRET=
```

Для Supabase используйте **Transaction pooler** connection string (порт **6543**).

Без `DATABASE_URL` деплой соберётся, но регистрация и кабинет работать не будут.

3. Build Command в Vercel (Settings → General → Build & Development Settings):

```text
npm run vercel-build
```

Эта команда применит миграции Prisma перед сборкой.

4. Deploy:

```bash
npm i -g vercel
vercel
```

## 5. Поддомен bonus.fillsdesign.ru

В DNS домена `fillsdesign.ru` добавьте:

| Тип | Имя | Значение |
|---|---|---|
| CNAME | bonus | cname.vercel-dns.com |

В Vercel → Project → Settings → Domains добавьте `bonus.fillsdesign.ru`.

## 6. Публикация JS-трекера

Файл [`integrations/tilda-ref-tracker.js`](./integrations/tilda-ref-tracker.js) доступен по адресу:

```text
https://bonus.fillsdesign.ru/tilda-ref-tracker.js
```

Он автоматически отдаётся из `public/tilda-ref-tracker.js`.

## 7. Smoke test после деплоя

1. Открыть `https://bonus.fillsdesign.ru`
2. Зарегистрировать тестового реферера
3. Открыть `https://fillsdesign.ru/?ref=CODE`
4. Отправить форму на Tilda
5. Проверить заявку в `/admin`
6. Указать сумму → «Оплачен» → «Доставлен → начислить бонус»
7. Проверить баланс в `/dashboard`

## 8. Локальный запуск

```bash
cp .env.example .env
# заполните DATABASE_URL и AUTH_SECRET
npm install
npx prisma migrate dev
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000)
