import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/db";
import { getAuthUser } from "@/backend/lib/jwt";
import UserModel from "@/backend/models/UserModel";
import QuizResultModel from "@/backend/models/QuizResultModel";
import GoalPlanModel from "@/backend/models/GoalPlanModel";
import PortfolioModel from "@/backend/models/PortfolioModel";
import SimulationModel from "@/backend/models/SimulationModel";

export async function GET(request: Request) {
  try {
    const { userId, role } = getAuthUser(request);
    if (role !== "teacher") {
      return NextResponse.json({ error: "Teachers only." }, { status: 403 });
    }

    await connectDB();

    // Find the teacher to get their class code
    const teacher = await UserModel.findById(userId).lean();
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    const classCode = teacher.classCode;
    if (!classCode) {
      return NextResponse.json([]);
    }

    // Students who enrolled with this class code
    const students = await UserModel.find({ classCode, role: "student" }).lean();

    // Fetch progress for each student in parallel
    const progress = await Promise.all(
      students.map(async (s) => {
        const sid = s._id.toString();
        const [quiz, goal, portfolio, simulation] = await Promise.all([
          QuizResultModel.exists({ userId: sid }),
          GoalPlanModel.exists({ userId: sid }),
          PortfolioModel.exists({ userId: sid }),
          SimulationModel.exists({ userId: sid }),
        ]);
        return {
          userId:         sid,
          studentName:    s.name,
          quizDone:       !!quiz,
          goalDone:       !!goal,
          portfolioDone:  !!portfolio,
          simulationDone: !!simulation,
        };
      })
    );

    return NextResponse.json(progress);
  } catch (err) {
    console.error("[GET /api/teacher/students]", err);
    return NextResponse.json({ error: "Unauthorized or server error." }, { status: 401 });
  }
}
