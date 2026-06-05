import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connection";
import { getModels } from "@/lib/db/models";
import { signToken } from "@/lib/auth/session";

export async function authenticateUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await connectDB();
  const { User } = getModels();
  const user = await User.findOne({ email });

  if (!(user && bcrypt.compareSync(password, user.hash))) {
    throw "Email or password is incorrect";
  }

  const token = signToken(user.id);
  return { ...user.toJSON(), token };
}

export async function getAllUsers() {
  await connectDB();
  const { User } = getModels();
  return User.find();
}

export async function getAllAgents() {
  await connectDB();
  const { User } = getModels();
  return User.find(
    { level: "agent" },
    { balance: 1, lastName: 1, firstName: 1, level: 1, code: 1 }
  );
}

export async function getUserById(id: string) {
  await connectDB();
  const { User } = getModels();
  return User.findById(id);
}

export async function createUser(params: Record<string, unknown>) {
  await connectDB();
  const { User } = getModels();
  if (await User.findOne({ email: params.email })) {
    throw `Email "${params.email}" is already taken`;
  }
  const user = new User(params);
  if (params.password) {
    user.hash = bcrypt.hashSync(params.password as string, 10);
  }
  await user.save();
}

export async function updateUser(id: string, params: Record<string, unknown>) {
  await connectDB();
  const { User } = getModels();
  const user = await User.findById(id);
  if (!user) throw "User not found";
  if (
    user.email !== params.email &&
    (await User.findOne({ email: params.email }))
  ) {
    throw `Email "${params.email}" is already taken`;
  }
  if (params.password) {
    params.hash = bcrypt.hashSync(params.password as string, 10);
  }
  await User.findByIdAndUpdate(id, params);
}

export async function deleteUser(id: string) {
  await connectDB();
  const { User } = getModels();
  await User.findByIdAndDelete(id);
}
