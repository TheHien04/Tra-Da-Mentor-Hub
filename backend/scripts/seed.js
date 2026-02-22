// backend/scripts/seed.js
/**
 * Database seeding script
 * Run: npm run seed
 */

import "dotenv/config.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import env from "../config/env.js";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import Mentee from "../models/Mentee.js";
import Group from "../models/Group.js";

async function seed() {
  try {
    // Connect to DB
    await mongoose.connect(env.databaseUrl, {
      autoIndex: true,
      maxPoolSize: 10,
    });

    console.log("🌱 Starting database seed...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Mentor.deleteMany({}),
      Mentee.deleteMany({}),
      Group.deleteMany({}),
    ]);

    // Create users
    console.log("👤 Creating users...");
    const userPassword = await bcrypt.hash("password123", 10);
    const adminPassword = await bcrypt.hash("AdminPass123", 10);

    // Admin user
    const adminUser = await User.create({
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
      avatar: "👑",
    });
    console.log("✅ Created admin user");

    const mentorUser1 = await User.create({
      email: "anhduong@example.com",
      password: userPassword,
      name: "Nguyễn Thị Ánh Dương",
      role: "mentor",
      avatar: "👩‍🏫",
    });

    const mentorUser2 = await User.create({
      email: "nhatpm@example.com",
      password: userPassword,
      name: "Phạm Minh Nhật",
      role: "mentor",
      avatar: "👨‍🏫",
    });

    const menteeUser1 = await User.create({
      email: "mentee1@example.com",
      password: userPassword,
      name: "Hoàng Minh Đức",
      role: "mentee",
      avatar: "👨‍🎓",
    });

    // Create mentors
    console.log("👨‍🏫 Creating mentors...");
    const mentor1 = await Mentor.create({
      userId: mentorUser1._id,
      expertise: ["ReactJS", "Next.js", "TailwindCSS", "TypeScript"],
      bio: "Senior Frontend Engineer with 6+ years experience",
      track: "tech",
      maxMentees: 6,
      mentorshipType: "GROUP",
      duration: "LONG_TERM",
    });

    const mentor2 = await Mentor.create({
      userId: mentorUser2._id,
      expertise: ["Node.js", "MongoDB", "REST API", "Docker"],
      bio: "Backend Developer specializing in Node.js",
      track: "tech",
      maxMentees: 5,
      mentorshipType: "GROUP",
      duration: "LONG_TERM",
    });

    // Create mentees
    console.log("👨‍🎓 Creating mentees...");
    const mentee1 = await Mentee.create({
      userId: menteeUser1._id,
      school: "HUST",
      interests: ["React", "Frontend", "Web Design"],
      track: "tech",
      mentorId: mentor1._id,
      mentorshipType: "GROUP",
      progress: 25,
    });

    // Create groups
    console.log("👥 Creating groups...");
    const group1 = await Group.create({
      name: "Frontend Avengers",
      description: "Learn React, Next.js and modern frontend development",
      topic: "React + TypeScript",
      mentorId: mentor1._id,
      mentees: [mentee1._id],
      maxCapacity: 5,
      meetingSchedule: {
        frequency: "Weekly",
        dayOfWeek: "Monday",
        time: "19:00",
      },
    });

    // Update references
    await Mentor.updateOne(
      { _id: mentor1._id },
      { mentees: [mentee1._id], groups: [group1._id] }
    );

    await Mentee.updateOne({ _id: mentee1._id }, { groupId: group1._id });

    console.log("✅ Database seeded successfully!");
    console.log("");
    console.log("📊 Created:");
    console.log(`   - ${4} Users (1 admin, 2 mentors, 1 mentee)`);
    console.log(`   - ${2} Mentors`);
    console.log(`   - ${1} Mentee`);
    console.log(`   - ${1} Group`);
    console.log("");
    console.log("🔐 Test credentials:");
    console.log("   Admin: admin@example.com / AdminPass123");
    console.log("   Mentor: anhduong@example.com / password123");
    console.log("   Password: password123");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
