# Fils Bonus

Реферальная программа для [fillsdesign.ru](https://fillsdesign.ru).

## Возможности

- регистрация любого участника с мгновенным получением ссылки и промокода;
- ступенчатый бонус: 5% / 7% / 10%;
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
- [integrations/TILDA_SETUP.md](./integrations/TILDA_SETUP.md) — настройка Tilda

## Основные URL

- `/` — лендинг программы
- `/register` — регистрация
- `/dashboard` — личный кабинет
- `/admin` — админка
- `/api/webhooks/tilda` — webhook заявок Tilda
