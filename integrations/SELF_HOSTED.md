# Self-hosted VPS (fillsbonus.ru)

Деплой на собственный сервер в России. Стек: Debian, Node.js (nvm), PM2, nginx, Let's Encrypt.

## Сервер

| Параметр | Значение |
|----------|----------|
| IP | `192.124.182.124` |
| Пользователь | `kalinin` |
| Проект | `~/fillsbonus` |
| Порт приложения | `3000` |
| PM2 | `fillsbonus` → `npm start` |
| nginx | `/etc/nginx/sites-enabled/fillsbonus.ru` → proxy `127.0.0.1:3000` |
| SSL | Certbot, `fillsbonus.ru` |

## Обновление после git push

```bash
ssh kalinin@192.124.182.124
cd ~/fillsbonus
git pull
npm install
npm run build
pm2 restart fillsbonus
```

## Переменные (.env)

```env
NEXT_PUBLIC_BONUS_URL=https://fillsbonus.ru
NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru
DATABASE_URL=...   # Supabase pooler :6543
AUTH_SECRET=...
```

После смены `NEXT_PUBLIC_*` — обязательно `npm run build` и `pm2 restart`.

## Тильда

```html
<script src="https://fillsbonus.ru/tilda-ref-tracker.js"></script>
```

Webhook: `https://fillsbonus.ru/api/webhooks/tilda`

## DNS (Reg.ru)

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `192.124.182.124` |

`www` — опционально: CNAME `www` → `fillsbonus.ru` + server_name в nginx.

## PM2 автозапуск

```bash
pm2 save
pm2 startup   # выполнить команду, которую выведет pm2
```

## Проверка

```bash
curl -s https://fillsbonus.ru/api/health
pm2 logs fillsbonus --lines 50
```
