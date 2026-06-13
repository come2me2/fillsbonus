# Настройка Tilda для реферальной программы FILLS

Подключение **fillsdesign.ru** (Tilda Business, проект `8575135`) к **fillsbonus**.

## Быстрый старт

| Шаг | Файл / действие |
|-----|-----------------|
| 0. Проверить backend | `npm run check:infra` |
| 1. HEAD всех страниц | [`tilda-head-snippet.html`](./tilda-head-snippet.html) |
| 2. Webhook + поля форм | [`tilda-webhook-config.md`](./tilda-webhook-config.md) |
| 3. Контент на сайте | [`tilda-site-content.html`](./tilda-site-content.html) |
| 4. Тест webhook | `npm run test:tilda-webhook -- FILSADMN` |

**Production URL (сейчас):** `https://fillsbonus.vercel.app`  
**Целевой URL:** `https://bonus.fillsdesign.ru` (после настройки DNS)

---

## 1. JS-трекер на всех страницах

Скрипт нужен на **всех** страницах сайта. В Tilda есть три способа — выберите любой.

### Способ A (лучший): вставка кода на весь сайт

Откройте **Настройки сайта** (иконка шестерёнки у названия проекта) и найдите один из путей:

| Где искать | Путь |
|------------|------|
| Вариант 1 | **Вставка кода** → **HTML-код для вставки внутрь head** |
| Вариант 2 | **Ещё** → **HTML-код для вставки внутрь head** |

> Если в «Ещё» нет этого пункта — используйте вкладку **«Вставка кода»** в левом меню настроек сайта (в новых версиях Tilda она вынесена отдельно).

Вставьте содержимое [`tilda-head-snippet.html`](./tilda-head-snippet.html), **сохраните** и **опубликуйте все страницы**.

### Способ B: на каждой странице отдельно

Если глобального поля нет — для **каждой** страницы с формой:

**Настройки страницы** (⚙ у страницы) → **Дополнительно** или **Вставка кода** → **HTML-код для вставки внутрь head**

Тот же код из `tilda-head-snippet.html`. Опубликуйте страницу.

### Способ C (запасной): блок T123 в шапке сайта

Если поля для head нигде нет:

1. Откройте **шапку (Header)**, которая стоит на всех страницах
2. Добавьте блок **T123 «HTML-код»** (Библиотека блоков → Другое)
3. Вставьте код из `tilda-head-snippet.html`
4. Опубликуйте сайт

Скрипт в `<body>` работает так же — для трекера ref-ссылок head не обязателен.

---

Скрипт [`public/tilda-ref-tracker.js`](../public/tilda-ref-tracker.js):
- читает `?ref=CODE` из URL;
- сохраняет код в `localStorage` и cookie на 365 дней;
- добавляет скрытое поле `ref_code` во все формы;
- заполняет видимое поле `promo_code`, если оно пустое.

**Проверка:**
1. Откройте `https://fillsdesign.ru/?ref=TESTCODE`
2. DevTools → Application → Local Storage → `fils_ref_code` = `TESTCODE`
3. На странице с формой → в `<form>` есть `input[name="ref_code"]`

---

## 2. Формы на Tilda

Для каждой формы (главная, каталог, cooperation, callback):

### Скрытое поле
- **Имя переменной:** `ref_code` (без пробелов; не `ref code`)
- **Тип:** hidden

### Webhook (Tilda Business)
См. [`tilda-webhook-config.md`](./tilda-webhook-config.md)

### Имена полей, которые понимает API

| Данные | Варианты имён |
|--------|---------------|
| Имя | `Name`, `name`, `Имя` |
| Телефон | **`Phone`**, `phone`, `tel`, `Телефон` |
| Email | `email`, `Email` |
| Промокод | `ref_code`, `promo_code`, `promo`, `Промокод` |

**Zero Block:** в **ПОЛЯ ВВОДА** у телефона задайте **Имя переменной** = `Phone`. Иначе webhook вернёт «Phone is required».

После сохранения webhook Tilda шлёт тест `test=test` — сервер отвечает `200 OK`.

---

## 3. Webhook URL

```
https://fillsbonus.vercel.app/api/webhooks/tilda
```

После DNS `bonus.fillsdesign.ru`:

```
https://bonus.fillsdesign.ru/api/webhooks/tilda
```

**Поведение:**
- без `ref_code` → `{ ok: true, skipped: true }` (обычная заявка, не реферал)
- с валидным кодом → заявка `LEAD` в `/admin`
- дубликат телефона → 409
- неверный код → 404

---

## 4. Контент на fillsdesign.ru

Вставьте блоки из [`tilda-site-content.html`](./tilda-site-content.html):
- ссылка «Реферальная программа» в футере / меню
- блок-призыв с текстом 5% + 5%

---

## 5. Процесс после заявки (админка)

1. Заявка появляется в `/admin` со статусом LEAD
2. Менеджер вводит **смету** → автоматически 5% скидка клиенту
3. **Оплачен** → **Доставлен** → начисление 5% рефереру
4. Реферер видит баланс в `/dashboard`

---

## 6. Переменные окружения (Vercel)

```env
AUTH_SECRET=...
ADMIN_EMAILS=info@filsdesign.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
NEXT_PUBLIC_BONUS_URL=https://bonus.fillsdesign.ru
TILDA_WEBHOOK_SECRET=...
```

---

## 7. Локальная отладка

```bash
npm run check:infra
npm run test:tilda-webhook -- YOUR_REF_CODE

curl -X POST http://localhost:3000/api/webhooks/tilda \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","Phone":"+79991234567","ref_code":"AB12CD34"}'
```
