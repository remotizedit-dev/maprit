import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/src/firebase/firebase-admin";

export const SUPER_ADMINS = [
  "remotizedit@gmail.com",
  "faiyaz.hossain@gmail.com",
  "faiyaz.hossain@cobait.com"
];

export interface VerifyAdminResult {
  isValid: boolean;
  uid?: string;
  email?: string;
  status?: number;
  error?: string;
}

export async function verifyAdmin(req: NextRequest): Promise<VerifyAdminResult> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { isValid: false, status: 401, error: "Unauthorized: Missing or invalid token format" };
    }
    
    const token = authHeader.substring(7);
    const app = getAdminApp();
    if (!app) {
      return { isValid: false, status: 500, error: "Internal server error: Firebase Admin not initialized" };
    }
    
    const decodedToken = await getAuth(app).verifyIdToken(token);
    const email = decodedToken.email;
    
    if (!email || !SUPER_ADMINS.includes(email.toLowerCase())) {
      return { isValid: false, status: 403, error: "Forbidden: Insufficient permissions" };
    }
    
    return { isValid: true, uid: decodedToken.uid, email: email };
  } catch (error: any) {
    console.error("[verifyAdmin] Verification failed:", error);
    return { isValid: false, status: 401, error: `Unauthorized: ${error.message || "Invalid token"}` };
  }
}
