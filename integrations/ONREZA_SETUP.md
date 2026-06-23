# Деплой fillsbonus на ONREZA (Россия, без Cloudflare)

Хостинг в Москве — сайт открывается в России без VPN. Бесплатный тариф: 0 ₽, до 5 своих доменов.

**Целевой URL:** `https://www.fillsbonus.ru`

Vercel можно оставить как резерв; основной трафик — ONREZA + DNS на Reg.ru.

---

## Чеклист миграции

- [ ] 1. Регистрация на [onreza.ru](https://onreza.ru/)
- [ ] 2. Создать проект, подключить GitHub `come2me2/fillsbonus`
- [ ] 3. Добавить переменные окружения (см. ниже)
- [ ] 4. Первый деплой (Git push или `nrz deploy`)
- [ ] 5. В ONREZA добавить домены `fillsbonus.ru` и `www.fillsbonus.ru`
- [ ] 6. Reg.ru: DNS-серверы Reg.ru (убрать Cloudflare)
- [ ] 7. Reg.ru: DNS-записи из панели ONREZA
- [ ] 8. Vercel: `NEXT_PUBLIC_BONUS_URL=https://www.fillsbonus.ru`
- [ ] 9. Тильда: скрипт и webhook на `www.fillsbonus.ru`
- [ ] 10. Проверка без VPN с телефона

---

## 1. Создание проекта на ONREZA

1. Войдите на [onreza.ru](https://onreza.ru/) → **Создать проект**.
2. Подключите репозиторий **come2me2/fillsbonus** (GitHub).
3. ONREZA определит Next.js автоматически; в репозитории есть `onreza.toml`.

### Build settings (если спросят)

| Параметр | Значение |
|----------|----------|
| Build command | `npm run onreza-build` |
| Start / entry | `.next/standalone/server.js` (process) |

---

## 2. Переменные окружения

Скопируйте из Vercel → Settings → Environment Variables:

```env
AUTH_SECRET=...длинная_случайная_строка...
ADMIN_EMAILS=info@filsdesign.ru
ADMIN_EMAIL=info@filsdesign.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
NEXT_PUBLIC_BONUS_URL=https://www.fillsbonus.ru
TILDA_WEBHOOK_SECRET=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

**База данных (Supabase):**

| Переменная | Что указать |
|------------|-------------|
| `DATABASE_URL` | Transaction pooler URI (порт **6543**) |
| `POSTGRES_URL_NON_POOLING` | Direct connection (порт **5432**) — для миграций при сборке |

Без `POSTGRES_URL_NON_POOLING` сборка пройдёт, но `prisma migrate deploy` может пропуститься — тогда миграции вручную:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 3. Деплой

### Через Git (рекомендуется)

Push в `main` → ONREZA собирает автоматически.

### Через CLI

```bash
npm i -g @onreza/nrz-cli
nrz login
nrz deploy --prod
```

---

## 4. Свой домен fillsbonus.ru

1. ONREZA → проект → **Domains** → добавить:
   - `fillsbonus.ru`
   - `www.fillsbonus.ru`
2. ONREZA покажет DNS-записи (A или CNAME) — **скопируйте их**.

---

## 5. DNS на Reg.ru (без Cloudflare)

### 5.1. Убрать Cloudflare

Reg.ru → `fillsbonus.ru` → **DNS-серверы**:

- Выберите **«DNS-серверы Reg.ru»** (не Cloudflare, не Vercel).
- Уберите `ada.ns.cloudflare.com` / `gerardo.ns.cloudflare.com`.

### 5.2. DNS-записи

Reg.ru → **Управление зоной** → добавьте записи **как в ONREZA** (пример):

| Тип | Имя | Значение |
|-----|-----|----------|
| A или CNAME | `@` | из панели ONREZA |
| CNAME | `www` | из панели ONREZA |

Не используйте Cloudflare. Прокси не нужен.

### 5.3. Редирект apex → www (опционально)

В ONREZA или Reg.ru: `fillsbonus.ru` → `https://www.fillsbonus.ru`.

---

## 6. Тильда (fillsdesign.ru)

### Скрипт на всех страницах

**Настройки сайта → Вставка кода → HTML в head:**

```html
<script src="https://www.fillsbonus.ru/tilda-ref-tracker.js"></script>
```

Или файл [`integrations/tilda-head-snippet.html`](./tilda-head-snippet.html).

Скрипт сам определяет API с того же домена, с которого загружен.

### Webhook на каждой форме

**Форма → Настройки → Webhook:**

```
https://www.fillsbonus.ru/api/webhooks/tilda
```

Метод: **POST**.

### Поля формы

| Поле | Имя переменной |
|------|----------------|
| Телефон | `Phone` |
| Промокод | `promo_code` |
| Реф. код (скрытое) | `ref_code` — трекер добавит сам |

Опубликуйте все страницы.

---

## 7. Проверка

```bash
npm run check:infra
```

Вручную без VPN (мобильный интернет):

1. `https://www.fillsbonus.ru` — главная
2. `https://www.fillsbonus.ru/login` — вход
3. `https://www.fillsbonus.ru/api/health` — `{"ok":true,...}`
4. `https://fillsdesign.ru/?ref=КОД` → форма с промокодом → заявка в `/admin`

---

## 8. Vercel (резерв)

Vercel можно не отключать. Обновите только:

```env
NEXT_PUBLIC_BONUS_URL=https://www.fillsbonus.ru
```

Ссылки в кабинете реферера будут вести на `www.fillsbonus.ru`.

---

## Устранение проблем

| Проблема | Решение |
|----------|---------|
| Сборка: Prisma | Добавьте `POSTGRES_URL_NON_POOLING` |
| 502 после деплоя | Проверьте логи ONREZA, `AUTH_SECRET` и `DATABASE_URL` |
| Домен не открывается | NS на Reg.ru, записи из ONREZA, подождать 15–60 мин |
| Webhook Tilda 401 | `TILDA_WEBHOOK_SECRET` совпадает с формой |
| Сайт на Vercel, ONREZA параллельно | Оба используют одну Supabase — нормально |

---

## Файлы в репозитории

| Файл | Назначение |
|------|------------|
| [`onreza.toml`](../onreza.toml) | Конфиг ONREZA |
| [`scripts/vercel-build.mjs`](../scripts/vercel-build.mjs) | Prisma + Next build (`onreza-build`) |
| [`integrations/tilda-head-snippet.html`](./tilda-head-snippet.html) | Код для Tilda head |
