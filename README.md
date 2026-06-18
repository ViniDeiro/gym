# Gym League

MVP mobile em React Native + Expo para ligas fitness entre amigos, usando API Node/Express e banco Neon Postgres.

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Configure `.env`:

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=troque-por-um-segredo-grande
PORT=3333
EXPO_PUBLIC_API_URL=http://localhost:3333
```

3. Rode a migracao no Neon:

```bash
npm run db:migrate
```

4. Suba a API:

```bash
npm run start:api
```

5. Em outro terminal, suba o app:

```bash
npm run start
```

No iOS Simulator, `http://localhost:3333` funciona. Em celular fisico, use o IP local do Mac em `EXPO_PUBLIC_API_URL`, por exemplo `http://192.168.0.10:3333`.

## MVP incluso

- Login e cadastro com e-mail/senha via API propria.
- Onboarding do conceito.
- Perfil com nome, foto, objetivo e academia atual.
- Criar liga e entrar por codigo.
- Check-in diario com tipo de treino, observacao e foto opcional.
- Ranking calculado por check-ins, streak, frequencia, desafios e penalidade por inatividade.
- Feed simples da liga com posts de check-in.
- Estrutura preparada para GPS, Apple Health, Google Fit, planos pagos, ligas publicas, batalhas 1x1 e ranking global.
