# Деплой Fils Bonus

**Для России (без VPN):** основной хостинг — [ONREZA](https://onreza.ru/) → [`integrations/ONREZA_SETUP.md`](./integrations/ONREZA_SETUP.md)

**Резерв / разработка:** Vercel (ниже).

---
## 1. Supabase PostgreSQL

1. Создайте проект на [supabase.com](https://supabase.com).
2. Скопируйте `DATABASE_URL` из **Project Settings → Database → Connection string (URI)**.
3. Используйте pooled connection string для Vercel.

## 2. Переменные окружения

### Supabase через Vercel (рекомендуется)

Если вы подключили Supabase в Vercel → Integrations, переменные добавляются с префиксом проекта, например:

- `FILLSBONUS_POSTGRES_PRISMA_URL` — для приложения (Prisma)
- `FILLSBONUS_POSTGRES_URL_NON_POOLING` — для миграций

Также поддерживаются стандартные имена без префикса: `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`.

**Добавьте вручную** в Vercel → Settings → Environment Variables:

```env
AUTH_SECRET=случайная_длинная_строка_32+_символов
ADMIN_EMAILS=info@filsdesign.ru
ADMIN_EMAIL=info@filsdesign.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
NEXT_PUBLIC_BONUS_URL=https://www.fillsbonus.ru
TILDA_WEBHOOK_SECRET=
```

`AUTH_SECRET` и `ADMIN_EMAILS` Supabase не создаёт — без них не будет входа и админки.

### Своя база (без интеграции Vercel)

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
ADMIN_EMAILS=info@filsdesign.ru
ADMIN_EMAIL=info@filsdesign.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
NEXT_PUBLIC_BONUS_URL=https://www.fillsbonus.ru
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
NEXT_PUBLIC_BONUS_URL=https://www.fillsbonus.ru
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

Файл [`public/tilda-ref-tracker.js`](./public/tilda-ref-tracker.js) доступен по адресам:

```text
https://fillsbonus.vercel.app/tilda-ref-tracker.js
https://bonus.fillsdesign.ru/tilda-ref-tracker.js   # после настройки DNS
```

Полная инструкция для Tilda: [`integrations/TILDA_SETUP.md`](./integrations/TILDA_SETUP.md)

Проверка инфраструктуры:

```bash
npm run check:infra
```

## 7. Smoke test после деплоя

1. Открыть `https://bonus.fillsdesign.ru`
2. Зарегистрировать тестового реферера
3. Открыть `https://fillsdesign.ru/?ref=CODE`
4. Отправить форму на Tilda
5. Проверить заявку в `/admin`
6. Указать сумму → «Оплачен» → «Доставлен → начислить бонус»
7. Проверить баланс в `/dashboard`

## Локальный запуск

```bash
cp .env.example .env
# заполните DATABASE_URL и AUTH_SECRET
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

### Демо-данные

Команда `npm run db:seed` создаёт mock-данные для `info@filsdesign.ru`:

- пароль по умолчанию: `Fils2024!`
- баланс, рефералы, транзакции для кабинета
- заявки и рефереры для админки

На production: войдите в `/admin` и нажмите **«Загрузить mock-данные»**.

Приложение: [http://localhost:3000](http://localhost:3000)
