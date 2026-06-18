# Gym League

MVP mobile em React Native + Expo para ligas fitness entre amigos, com autenticação via Supabase, ligas, check-in diário, ranking por pontos, feed social e perfil.

## Como rodar

1. Instale dependências:

```bash
npm install
```

2. Crie um projeto no Supabase e rode a migração em `supabase/migrations/001_initial_schema.sql`.

3. Copie `.env.example` para `.env` e preencha:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

4. Inicie:

```bash
npm run start
```

## MVP incluso

- Login e cadastro com e-mail/senha.
- Onboarding do conceito.
- Perfil com nome, foto, objetivo e academia atual.
- Criar liga e entrar por código.
- Check-in diário com tipo de treino, observação e foto opcional.
- Ranking calculado por check-ins, streak, frequência, desafios e penalidade por inatividade.
- Feed simples da liga com posts de check-in.
- Estrutura preparada para GPS, Apple Health, Google Fit, planos pagos, ligas públicas, batalhas 1x1 e ranking global.
