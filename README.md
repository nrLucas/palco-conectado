# Palco Conectado

**Conectando talentos a grandes palcos.**

Marketplace para bandas, músicos e estabelecimentos negociarem shows.

## Stack

- **Next.js 16** + **React 19** (App Router)
- **PostgreSQL** + **Prisma 6** (Vercel Postgres em produção)
- **Auth.js v5** — credenciais + Google OAuth
- **TanStack Query** + **shadcn/ui** + **Tailwind CSS 3**

## Funcionalidades

- Autenticação (email/senha e Google)
- Multi-perfil (artista, banda, contratante)
- CRUD de músicos, bandas e estabelecimentos
- Propostas simples (enviar, aceitar, recusar, cancelar)
- Notificações in-app (polling a cada 30s)
- Seed com dados demo

## Setup local

### 1. Dependências

```bash
npm install --legacy-peer-deps
```

### 2. Banco de dados

```bash
docker compose up -d
cp .env.example .env.local
```

Edite `.env.local` com `AUTH_SECRET` e credenciais Google (opcional para dev).

### 3. Migrar e popular

```bash
npm run db:push
npm run db:seed
```

### 4. Rodar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Contas demo (após seed)

| Email            | Senha   |
| ---------------- | ------- |
| demo@palco.com   | demo123 |
| banda@palco.com  | demo123 |
| bar@palco.com    | demo123 |
| musico@palco.com | demo123 |

## Deploy na Vercel

1. Crie **Vercel Postgres** e link ao projeto
2. Configure variáveis: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. No Google Cloud Console, adicione redirect URI: `https://seu-dominio.vercel.app/api/auth/callback/google`
4. Build command: `prisma generate && prisma migrate deploy && next build` (ou use `db:push` na primeira vez)
5. Após deploy: `npm run db:seed` via Vercel CLI ou script manual

## Scripts

| Script               | Descrição                     |
| -------------------- | ----------------------------- |
| `npm run dev`        | Servidor de desenvolvimento   |
| `npm run build`      | Build de produção             |
| `npm run db:push`    | Sincroniza schema com o banco |
| `npm run db:migrate` | Cria/aplica migrations        |
| `npm run db:seed`    | Popula dados demo             |

---

**Palco Conectado © 2026**
