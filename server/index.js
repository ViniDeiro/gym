require("dotenv").config();

const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const { query } = require("./db");
const { calculateUserPoints, getCurrentStreak, getWeeklyFrequency } = require("./scoring");

const app = express();
const port = process.env.PORT || 3333;
const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";

app.use(cors());
app.use(express.json({ limit: "12mb" }));

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url,
    goal: row.goal,
    current_gym: row.current_gym,
    created_at: row.created_at
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: "30d" });
}

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Nao autenticado" });

  try {
    const payload = jwt.verify(token, jwtSecret);
    const { rows } = await query("select * from users where id = $1", [payload.sub]);
    if (!rows[0]) return res.status(401).json({ error: "Usuario nao encontrado" });
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ error: "Sessao invalida" });
  }
}

async function assertLeagueMember(userId, leagueId) {
  const { rows } = await query("select 1 from league_members where user_id = $1 and league_id = $2", [userId, leagueId]);
  if (!rows[0]) {
    const error = new Error("Voce nao participa desta liga");
    error.status = 403;
    throw error;
  }
}

async function assertPostVisible(userId, postId) {
  const { rows } = await query(
    `select p.* from posts p
     join league_members lm on lm.league_id = p.league_id
     where p.id = $1 and lm.user_id = $2`,
    [postId, userId]
  );

  if (!rows[0]) {
    const error = new Error("Post nao encontrado");
    error.status = 404;
    throw error;
  }

  return rows[0];
}

function inviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function seedDefaultChallenges(leagueId) {
  const startsAt = new Date();
  const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await query(
    `insert into challenges (league_id, title, description, points, challenge_type, target_value, workout_type, starts_at, ends_at)
     values
     ($1, 'Treinar 3x na semana', 'Complete tres check-ins em uma mesma semana.', 30, 'weekly_count', 3, null, $2, $3),
     ($1, '5 dias seguidos', 'Mantenha uma sequencia de cinco dias treinando.', 40, 'streak', 5, null, $2, $3),
     ($1, 'Cardio 3x na semana', 'Faca tres treinos de cardio em uma semana.', 30, 'workout_type_count', 3, 'cardio', $2, $3)`,
    [leagueId, startsAt, endsAt]
  );
}

function challengeProgress(challenge, checkins) {
  if (challenge.challenge_type === "streak") return getCurrentStreak(checkins);
  if (challenge.challenge_type === "weekly_count") return getWeeklyFrequency(checkins);
  if (challenge.challenge_type === "workout_type_count") return checkins.filter((checkin) => checkin.workout_type === challenge.workout_type).length;
  if (challenge.challenge_type === "weekday") return checkins.filter((checkin) => new Date(checkin.checked_in_on).getDay() === 1).length;
  if (challenge.challenge_type === "monthly_count") {
    const month = new Date().toISOString().slice(0, 7);
    return checkins.filter((checkin) => new Date(checkin.checked_in_on).toISOString().startsWith(month)).length;
  }
  return 0;
}

async function updateChallengeProgress(userId, leagueId) {
  const [{ rows: challenges }, { rows: checkins }] = await Promise.all([
    query("select * from challenges where league_id = $1 and starts_at <= now() and ends_at >= now()", [leagueId]),
    query("select * from checkins where league_id = $1 and user_id = $2", [leagueId, userId])
  ]);

  await Promise.all(
    challenges.map((challenge) => {
      const progress = challengeProgress(challenge, checkins);
      const completed = progress >= challenge.target_value;
      return query(
        `insert into user_challenges (challenge_id, user_id, progress, status, completed_at)
         values ($1, $2, $3, $4, $5)
         on conflict (challenge_id, user_id)
         do update set progress = excluded.progress, status = excluded.status, completed_at = coalesce(user_challenges.completed_at, excluded.completed_at)`,
        [challenge.id, userId, Math.min(progress, challenge.target_value), completed ? "completed" : "active", completed ? new Date() : null]
      );
    })
  );
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Nome, email e senha sao obrigatorios" });
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      "insert into users (email, password_hash, name) values ($1, $2, $3) returning *",
      [email.toLowerCase().trim(), passwordHash, name.trim()]
    );
    res.json({ token: signToken(rows[0]), user: publicUser(rows[0]) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "E-mail ja cadastrado" });
    next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await query("select * from users where email = $1", [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Email ou senha invalidos" });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

app.put("/me", auth, async (req, res, next) => {
  try {
    const { name, avatar_url, goal, current_gym } = req.body;
    const { rows } = await query(
      `update users set name = $1, avatar_url = $2, goal = $3, current_gym = $4, updated_at = now()
       where id = $5 returning *`,
      [name, avatar_url || null, goal || null, current_gym || null, req.user.id]
    );
    res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.get("/leagues", auth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `select l.* from leagues l
       join league_members lm on lm.league_id = l.id
       where lm.user_id = $1
       order by lm.joined_at desc`,
      [req.user.id]
    );
    res.json({ leagues: rows });
  } catch (error) {
    next(error);
  }
});

app.post("/leagues", auth, async (req, res, next) => {
  try {
    const { name, description, coverUrl } = req.body;
    const { rows } = await query(
      "insert into leagues (owner_id, name, description, cover_url, invite_code) values ($1, $2, $3, $4, $5) returning *",
      [req.user.id, name, description || null, coverUrl || null, inviteCode()]
    );
    await query("insert into league_members (league_id, user_id, role) values ($1, $2, 'owner')", [rows[0].id, req.user.id]);
    await seedDefaultChallenges(rows[0].id);
    res.json({ league: rows[0] });
  } catch (error) {
    next(error);
  }
});

app.post("/leagues/join", auth, async (req, res, next) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const { rows } = await query("select * from leagues where invite_code = $1", [code]);
    if (!rows[0]) return res.status(404).json({ error: "Liga nao encontrada" });
    await query(
      "insert into league_members (league_id, user_id, role) values ($1, $2, 'member') on conflict (league_id, user_id) do nothing",
      [rows[0].id, req.user.id]
    );
    res.json({ league: rows[0] });
  } catch (error) {
    next(error);
  }
});

app.get("/leagues/:leagueId", auth, async (req, res, next) => {
  try {
    await assertLeagueMember(req.user.id, req.params.leagueId);
    const [{ rows: leagues }, { rows: members }, { rows: challenges }] = await Promise.all([
      query("select * from leagues where id = $1", [req.params.leagueId]),
      query(
        `select
           lm.*,
           json_build_object(
             'id', u.id,
             'email', u.email,
             'name', u.name,
             'avatar_url', u.avatar_url,
             'goal', u.goal,
             'current_gym', u.current_gym,
             'created_at', u.created_at
           ) as users
         from league_members lm
         join users u on u.id = lm.user_id
         where lm.league_id = $1
         order by lm.joined_at`,
        [req.params.leagueId]
      ),
      query("select * from challenges where league_id = $1 order by starts_at desc", [req.params.leagueId])
    ]);
    res.json({ league: leagues[0], members, challenges });
  } catch (error) {
    next(error);
  }
});

app.get("/leagues/:leagueId/ranking", auth, async (req, res, next) => {
  try {
    await assertLeagueMember(req.user.id, req.params.leagueId);
    const [{ rows: members }, { rows: checkins }, { rows: userChallenges }] = await Promise.all([
      query(
        `select lm.user_id, u.name, u.avatar_url
         from league_members lm join users u on u.id = lm.user_id
         where lm.league_id = $1`,
        [req.params.leagueId]
      ),
      query("select * from checkins where league_id = $1", [req.params.leagueId]),
      query(
        `select uc.* from user_challenges uc
         join challenges c on c.id = uc.challenge_id
         where c.league_id = $1 and uc.status = 'completed'`,
        [req.params.leagueId]
      )
    ]);
    const ranking = members
      .map((member) => {
        const memberCheckins = checkins.filter((checkin) => checkin.user_id === member.user_id);
        const completedChallenges = userChallenges.filter((challenge) => challenge.user_id === member.user_id);
        return {
          userId: member.user_id,
          name: member.name,
          avatarUrl: member.avatar_url,
          points: calculateUserPoints(memberCheckins, completedChallenges),
          checkins: memberCheckins.length,
          weeklyFrequency: getWeeklyFrequency(memberCheckins),
          streak: getCurrentStreak(memberCheckins),
          rank: 0
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
    res.json({ ranking });
  } catch (error) {
    next(error);
  }
});

app.get("/leagues/:leagueId/checkins/today", auth, async (req, res, next) => {
  try {
    await assertLeagueMember(req.user.id, req.params.leagueId);
    const { rows } = await query(
      "select id from checkins where league_id = $1 and user_id = $2 and checked_in_on = current_date",
      [req.params.leagueId, req.user.id]
    );
    res.json({ checkedIn: Boolean(rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.post("/leagues/:leagueId/checkins", auth, async (req, res, next) => {
  try {
    await assertLeagueMember(req.user.id, req.params.leagueId);
    const { workoutType, note, photoUrl } = req.body;
    if (!photoUrl) return res.status(400).json({ error: "A foto do treino e obrigatoria para validar o check-in." });

    const { rows } = await query(
      `insert into checkins (league_id, user_id, workout_type, note, photo_url, verification_status, anti_cheat_meta)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning *`,
      [
        req.params.leagueId,
        req.user.id,
        workoutType,
        note || null,
        photoUrl || null,
        "photo_pending",
        JSON.stringify({ source: "manual", gps_ready: false, health_provider_ready: false })
      ]
    );
    await query("insert into posts (league_id, user_id, checkin_id, message) values ($1, $2, $3, $4)", [
      req.params.leagueId,
      req.user.id,
      rows[0].id,
      `fez treino de ${String(workoutType).replace("_", " ")} hoje`
    ]);
    await updateChallengeProgress(req.user.id, req.params.leagueId);
    res.json({ checkin: rows[0] });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Voce ja fez check-in nesta liga hoje." });
    next(error);
  }
});

app.get("/leagues/:leagueId/feed", auth, async (req, res, next) => {
  try {
    await assertLeagueMember(req.user.id, req.params.leagueId);
    const { rows } = await query(
      `select
         p.*,
         json_build_object('name', u.name, 'avatar_url', u.avatar_url) as users,
         case
           when c.id is null then null
           else json_build_object('photo_url', c.photo_url, 'workout_type', c.workout_type, 'note', c.note)
         end as checkins,
         (select count(*)::int from post_likes pl where pl.post_id = p.id) as likes_count,
         exists(select 1 from post_likes pl where pl.post_id = p.id and pl.user_id = $2) as liked_by_me,
         (select count(*)::int from post_comments pc where pc.post_id = p.id) as comments_count,
         coalesce(
           (
             select json_agg(comment_rows.* order by comment_rows.created_at asc)
             from (
               select
                 pc.id,
                 pc.body,
                 pc.created_at,
                 json_build_object('name', cu.name, 'avatar_url', cu.avatar_url) as users
               from post_comments pc
               join users cu on cu.id = pc.user_id
               where pc.post_id = p.id
               order by pc.created_at asc
               limit 3
             ) comment_rows
           ),
           '[]'::json
         ) as comments
       from posts p join users u on u.id = p.user_id
       left join checkins c on c.id = p.checkin_id
       where p.league_id = $1
       order by p.created_at desc
       limit 40`,
      [req.params.leagueId, req.user.id]
    );
    res.json({ posts: rows });
  } catch (error) {
    next(error);
  }
});

app.get("/leagues/:leagueId/challenge-progress", auth, async (req, res, next) => {
  try {
    await assertLeagueMember(req.user.id, req.params.leagueId);
    const { rows } = await query(
      `select uc.* from user_challenges uc
       join challenges c on c.id = uc.challenge_id
       where c.league_id = $1 and uc.user_id = $2`,
      [req.params.leagueId, req.user.id]
    );
    res.json({ progress: rows });
  } catch (error) {
    next(error);
  }
});

app.post("/posts/:postId/like", auth, async (req, res, next) => {
  try {
    await assertPostVisible(req.user.id, req.params.postId);
    const { rows: existing } = await query("select 1 from post_likes where post_id = $1 and user_id = $2", [req.params.postId, req.user.id]);
    const liked = !existing[0];

    if (liked) {
      await query("insert into post_likes (post_id, user_id) values ($1, $2) on conflict do nothing", [req.params.postId, req.user.id]);
    } else {
      await query("delete from post_likes where post_id = $1 and user_id = $2", [req.params.postId, req.user.id]);
    }

    const { rows } = await query("select count(*)::int as likes_count from post_likes where post_id = $1", [req.params.postId]);
    res.json({ liked, likesCount: rows[0].likes_count });
  } catch (error) {
    next(error);
  }
});

app.post("/posts/:postId/comments", auth, async (req, res, next) => {
  try {
    await assertPostVisible(req.user.id, req.params.postId);
    const body = String(req.body.body || "").trim();
    if (!body) return res.status(400).json({ error: "Comentario vazio" });

    const { rows } = await query(
      `insert into post_comments (post_id, user_id, body)
       values ($1, $2, $3)
       returning id, body, created_at`,
      [req.params.postId, req.user.id, body.slice(0, 280)]
    );

    res.json({
      comment: {
        ...rows[0],
        users: {
          name: req.user.name,
          avatar_url: req.user.avatar_url
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get("/posts/:postId/comments", auth, async (req, res, next) => {
  try {
    await assertPostVisible(req.user.id, req.params.postId);
    const { rows } = await query(
      `select
         pc.id,
         pc.body,
         pc.created_at,
         json_build_object('name', u.name, 'avatar_url', u.avatar_url) as users
       from post_comments pc
       join users u on u.id = pc.user_id
       where pc.post_id = $1
       order by pc.created_at asc`,
      [req.params.postId]
    );
    res.json({ comments: rows });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || "Erro interno" });
});

app.listen(port, () => {
  console.log(`Gym League API running on http://localhost:${port}`);
});
