import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/src/firebase/firebase-admin";
import { verifyAdmin } from "@/src/lib/verify-admin";

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.isValid) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const auth = getAuth(app);
    const listResult = await auth.listUsers(100);
    const users = listResult.users.map(u => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || "",
      disabled: u.disabled,
      createdAt: u.metadata.creationTime,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("[Admin API GET] Failed to list users:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.isValid) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const auth = getAuth(app);
    const userRecord = await auth.createUser({
      email,
      password,
    });

    return NextResponse.json({ 
      success: true, 
      message: "User created successfully", 
      user: { uid: userRecord.uid, email: userRecord.email } 
    });
  } catch (error: any) {
    console.error("[Admin API POST] Failed to create user:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.isValid) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const { uid, password } = await req.json();
    if (!uid || !password) {
      return NextResponse.json({ success: false, error: "UID and password are required" }, { status: 400 });
    }

    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const auth = getAuth(app);
    
    // Check if target is the primary root admin
    const targetUser = await auth.getUser(uid);
    if (targetUser.email && targetUser.email.toLowerCase() === "remotizedit@gmail.com") {
      if (authResult.email?.toLowerCase() !== "remotizedit@gmail.com") {
        return NextResponse.json({ success: false, error: "Unauthorized: Only remotizedit@gmail.com can update their own password" }, { status: 403 });
      }
    }

    await auth.updateUser(uid, { password });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("[Admin API PATCH] Failed to update password:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.isValid) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 });
    }

    const app = getAdminApp();
    if (!app) {
      return NextResponse.json({ success: false, error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const auth = getAuth(app);
    
    // Check if target is the primary root admin
    const targetUser = await auth.getUser(uid);
    if (targetUser.email && targetUser.email.toLowerCase() === "remotizedit@gmail.com") {
      return NextResponse.json({ success: false, error: "Unauthorized: Cannot delete the primary admin account" }, { status: 403 });
    }
    
    // Prevent self-deletion
    if (uid === authResult.uid) {
      return NextResponse.json({ success: false, error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await auth.deleteUser(uid);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("[Admin API DELETE] Failed to delete user:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
