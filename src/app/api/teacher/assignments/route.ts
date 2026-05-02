import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import { normalize, normalizeAll } from "@/backend/lib/normalize";
import AssignmentModel from "@/backend/models/AssignmentModel";

export async function GET(request: NextRequest) {
  try {
    const { userId, role } = getAuthUser(request);
    if (role !== "teacher") {
      return NextResponse.json({ error: "Teachers only." }, { status: 403 });
    }

    await connectDB();
    const assignments = await AssignmentModel.find({ teacherId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(normalizeAll(assignments));
  } catch (err) {
    console.error("[GET /api/teacher/assignments]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = getAuthUser(request);
    if (role !== "teacher") {
      return NextResponse.json({ error: "Teachers only." }, { status: 403 });
    }

    const body = await request.json();
    if (!body.title?.trim() || !body.classCode?.trim()) {
      return NextResponse.json({ error: "title and classCode are required." }, { status: 400 });
    }

    await connectDB();

    const assignment = await AssignmentModel.create({
      teacherId:   userId,
      title:       body.title.trim(),
      description: body.description?.trim() || undefined,
      dueDate:     body.dueDate || undefined,
      classCode:   body.classCode.trim(),
    });

    return NextResponse.json(normalize(assignment.toObject()), { status: 201 });
  } catch (err) {
    console.error("[POST /api/teacher/assignments]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
