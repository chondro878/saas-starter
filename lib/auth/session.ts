import { compare, hash } from 'bcryptjs';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function setSession(accessToken: string, refreshToken: string) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}