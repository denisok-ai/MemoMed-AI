# Настройка SSL для nginx

Поместите SSL-сертификаты в эту папку:
- `ssl/cert.pem` — публичный сертификат
- `ssl/key.pem` — приватный ключ

## Получение сертификата через Let's Encrypt (certbot):

```bash
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

## Самоподписанный сертификат для тестов:

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```
