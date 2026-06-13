# Fils Bonus

Реферальная программа для [fillsdesign.ru](https://fillsdesign.ru).

## Возможности

- регистрация любого участника с мгновенным получением ссылки и промокода;
- фиксированный бонус: 5% пригласившему и 5% скидка приглашённому;
- личный кабинет реферера;
- админка для подтверждения оплаты, доставки и выплат;
- webhook Tilda Business;
- JS-трекер реферальных ссылок для сайта на Tilda.

## Быстрый старт

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

## Документация

- [DEPLOY.md](./DEPLOY.md) — деплой на Vercel + Supabase
- [integrations/TILDA_SETUP.md](./integrations/TILDA_SETUP.md) — подключение fillsdesign.ru (Tilda)

## Интеграция с Tilda

```bash
npm run check:infra          # проверка backend
npm run test:tilda-webhook   # тест webhook (ref_code по умолчанию FILSADMN)
```

Готовые фрагменты для вставки в Tilda: [`integrations/`](./integrations/)

## Основные URL

- `/` — лендинг программы
- `/register` — регистрация
- `/dashboard` — личный кабинет
- `/admin` — админка
- `/api/webhooks/tilda` — webhook заявок Tilda
