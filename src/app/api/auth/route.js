import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import {
  COOKIE_NAME,
  createSessionToken,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "../../../lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, name, password } = body;
    const username = body.username?.trim().toLowerCase();

    if (!username || !password || password.length < 3) {
      return Response.json(
        { error: "Informe usuário e uma senha (mín. 3 caracteres)" },
        { status: 400 }
      );
    }

    let user;

    if (action === "register") {
      const nomeExibicao = name?.trim() || username;
      const existente = await prisma.user.findUnique({ where: { username } });
      if (existente) {
        return Response.json(
          { error: "Esse nome de usuário já está em uso" },
          { status: 409 }
        );
      }

      user = await prisma.user.create({
        data: {
          username,
          name: nomeExibicao,
          passwordHash: hashPassword(password),
          annualGoal: 12,
        },
      });

      // Garante que o usuário tenha sua estante Principal
      const estanteExistente = await prisma.shelf.findFirst({
        where: { userId: user.id },
      });
      if (!estanteExistente) {
        await prisma.shelf.create({
          data: {
            userId: user.id,
            name: "Principal",
            isDefault: true,
          },
        });
      }
    } else {
      user = await prisma.user.findUnique({ where: { username } });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return Response.json(
          { error: "Usuário ou senha incorretos" },
          { status: 401 }
        );
      }
    }

    const token = createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 dias
    });

    return Response.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        annualGoal: user.annualGoal,
      },
    });
  } catch {
    return Response.json({ error: "Erro ao autenticar" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }
    const data = await request.json();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.annualGoal !== undefined && {
          annualGoal: Math.max(1, Math.min(365, Number(data.annualGoal) || 12)),
        }),
        ...(data.name !== undefined && data.name.trim() && {
          name: data.name.trim(),
        }),
      },
      select: { id: true, username: true, name: true, annualGoal: true },
    });
    return Response.json({ user: updated });
  } catch {
    return Response.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return Response.json({ ok: true });
}
