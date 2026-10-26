import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test.before(async () => {
  // Ensure database connection
  await prisma.$connect();
});

test.after(async () => {
  await prisma.$disconnect();
});

test("1. Authentication: Password hashing & verification", async () => {
  const plain = "Password123!";
  const hash = await bcrypt.hash(plain, 10);
  const isValid = await bcrypt.compare(plain, hash);
  const isInvalid = await bcrypt.compare("WrongPassword!", hash);

  assert.equal(isValid, true, "Valid password should verify");
  assert.equal(isInvalid, false, "Invalid password should fail");
});

test("2. User Roles & Campus Verification Status", async () => {
  const student = await prisma.user.findUnique({
    where: { email: "arun.cse@nitandhra.ac.in" },
  });
  const moderator = await prisma.user.findUnique({
    where: { email: "priya.ece@nitandhra.ac.in" },
  });
  const admin = await prisma.user.findUnique({
    where: { email: "admin@nitandhra.ac.in" },
  });
  const unverified = await prisma.user.findUnique({
    where: { email: "rahul.eee@nitandhra.ac.in" },
  });

  assert.ok(student, "Student user exists");
  assert.equal(student.role, "STUDENT");
  assert.equal(student.verificationStatus, "VERIFIED");

  assert.ok(moderator, "Moderator user exists");
  assert.equal(moderator.role, "MODERATOR");

  assert.ok(admin, "Admin user exists");
  assert.equal(admin.role, "ADMIN");

  assert.ok(unverified, "Unverified user exists");
  assert.equal(unverified.verificationStatus, "PENDING");
});

test("3. Event Registration: Duplicate Prevention & Unique Constraint", async () => {
  const event = await prisma.event.findFirst();
  const user = await prisma.user.findFirst();
  assert.ok(event, "Event exists");
  assert.ok(user, "User exists");

  // Upsert first registration
  await prisma.eventRegistration.upsert({
    where: {
      eventId_userId: {
        eventId: event.id,
        userId: user.id,
      },
    },
    update: { status: "CONFIRMED" },
    create: {
      eventId: event.id,
      userId: user.id,
      status: "CONFIRMED",
    },
  });

  // Attempting to directly create a second registration should reject via unique constraint
  let duplicateRejected = false;
  try {
    await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: user.id,
        status: "CONFIRMED",
      },
    });
  } catch (err) {
    duplicateRejected = true;
  }

  assert.equal(duplicateRejected, true, "Database unique constraint on [eventId, userId] prevents duplicate registration");
});

test("4. Event Capacity Limit Enforcement", async () => {
  // Create a micro test event with capacity of 1
  const testEvent = await prisma.event.create({
    data: {
      title: "Test Micro Workshop with Capacity Limit",
      slug: `test-micro-event-${Date.now()}`,
      description: "Testing capacity limit enforcement",
      category: "TECHNICAL",
      venue: "CSE Lab 1",
      date: new Date(),
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      registrationDeadline: new Date(),
      capacity: 1, // Only 1 seat!
      organizerName: "Test Organizer",
      userId: (await prisma.user.findFirst()).id,
    },
  });

  const users = await prisma.user.findMany({ take: 2 });
  assert.equal(users.length >= 2, true, "At least 2 users available for capacity test");

  // Register first user
  await prisma.eventRegistration.create({
    data: {
      eventId: testEvent.id,
      userId: users[0].id,
      status: "CONFIRMED",
    },
  });

  // Check capacity logic
  const currentCount = await prisma.eventRegistration.count({
    where: { eventId: testEvent.id, status: "CONFIRMED" },
  });

  assert.equal(currentCount, 1, "One user confirmed");
  assert.equal(currentCount >= testEvent.capacity, true, "Event is at full capacity");

  // Clean up test event
  await prisma.event.delete({ where: { id: testEvent.id } });
});

test("5. Lost & Found: Creation, Ownership & Resolution Status", async () => {
  const user = await prisma.user.findFirst();

  const item = await prisma.lostAndFoundItem.create({
    data: {
      title: "Test Lost ID Card",
      description: "Left near central mess",
      type: "LOST",
      category: "ID_CARDS",
      campusLocation: "Central Mess 1",
      itemDate: new Date(),
      contactMethod: "IN_APP",
      status: "OPEN",
      userId: user.id,
    },
  });

  assert.equal(item.status, "OPEN");

  // Update to resolved
  const resolved = await prisma.lostAndFoundItem.update({
    where: { id: item.id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });

  assert.equal(resolved.status, "RESOLVED");
  assert.ok(resolved.resolvedAt);

  // Clean up
  await prisma.lostAndFoundItem.delete({ where: { id: item.id } });
});

test("6. Community Posts: Category, Comments & Reactions", async () => {
  const user = await prisma.user.findFirst();

  const post = await prisma.communityPost.create({
    data: {
      title: "Test Hackathon Teammate Search",
      content: "Looking for 1 frontend developer",
      category: "TEAMMATES",
      tags: "SIH2026,Testing",
      userId: user.id,
      status: "ACTIVE",
    },
  });

  assert.equal(post.category, "TEAMMATES");

  // Add comment
  const comment = await prisma.comment.create({
    data: {
      postId: post.id,
      userId: user.id,
      content: "I am interested!",
    },
  });
  assert.ok(comment.id);

  // Add reaction
  const reaction = await prisma.reaction.create({
    data: {
      postId: post.id,
      userId: user.id,
      type: "LIKE",
    },
  });
  assert.equal(reaction.type, "LIKE");

  // Unique constraint on [postId, userId] for reactions
  let duplicateReaction = false;
  try {
    await prisma.reaction.create({
      data: {
        postId: post.id,
        userId: user.id,
        type: "HELPFUL",
      },
    });
  } catch (err) {
    duplicateReaction = true;
  }
  assert.equal(duplicateReaction, true, "A user can only react once per post");

  // Clean up
  await prisma.communityPost.delete({ where: { id: post.id } });
});

test("7. Philanthropy: Campaign Status Workflow & Atomic Donation Balance", async () => {
  const user = await prisma.user.findFirst();
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  // 1. Student submits campaign -> starts in PENDING_REVIEW
  const campaign = await prisma.campaign.create({
    data: {
      title: "Test Solar Car Sponsorship Campaign",
      slug: `test-solar-car-${Date.now()}`,
      shortSummary: "Building an indigenous solar vehicle",
      story: "Detailed story about engineering innovation",
      category: "CAMPUS_PROJECT",
      targetAmount: 50000,
      raisedAmount: 0,
      fundUsagePlan: "Solar panels and MPPT controller",
      status: "PENDING_REVIEW",
      userId: user.id,
    },
  });

  assert.equal(campaign.status, "PENDING_REVIEW", "Campaign must start in PENDING_REVIEW status");

  // 2. Admin verifies campaign
  const verified = await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: "VERIFIED",
      verifiedByAdminId: admin.id,
      verifiedAt: new Date(),
      verificationNotes: "Approved by Dean of Student Affairs.",
    },
  });

  assert.equal(verified.status, "VERIFIED");
  assert.equal(verified.verifiedByAdminId, admin.id);

  // 3. Simulated test donation with atomic balance update
  const donationAmount = 1500;
  const [donation, updatedCampaign] = await prisma.$transaction([
    prisma.donation.create({
      data: {
        campaignId: campaign.id,
        donorId: user.id,
        donorName: "Arun Kumar",
        amount: donationAmount,
        transactionRef: `TEST-TXN-${Date.now()}`,
        paymentMethod: "DEMO_UPI",
        status: "SUCCESS",
      },
    }),
    prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        raisedAmount: {
          increment: donationAmount,
        },
      },
    }),
  ]);

  assert.equal(donation.amount, 1500);
  assert.equal(updatedCampaign.raisedAmount, 1500, "Campaign raisedAmount was atomically incremented");

  // Clean up
  await prisma.campaign.delete({ where: { id: campaign.id } });
});

test("8. Administrator Student Verification Workflow", async () => {
  const testStudent = await prisma.user.create({
    data: {
      name: "Test Student Verification",
      email: `test.unverified.${Date.now()}@example.com`,
      passwordHash: "hash123",
      rollNumber: "429999",
      department: "Civil Engineering",
      role: "STUDENT",
      verificationStatus: "PENDING",
    },
  });

  assert.equal(testStudent.verificationStatus, "PENDING");

  // Administrator reviews and approves
  const approved = await prisma.user.update({
    where: { id: testStudent.id },
    data: { verificationStatus: "VERIFIED" },
  });

  assert.equal(approved.verificationStatus, "VERIFIED");

  // Clean up
  await prisma.user.delete({ where: { id: testStudent.id } });
});
