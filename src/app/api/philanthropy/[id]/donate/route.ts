import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      amount,
      donorName,
      donorEmail,
      isAnonymous,
      message,
      paymentMethod = "DEMO_UPI",
    } = body;

    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid donation amount greater than 0" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "VERIFIED" && campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Donations cannot be processed. Campaign status is ${campaign.status}.` },
        { status: 400 }
      );
    }

    const finalDonorName = isAnonymous
      ? "Anonymous Supporter"
      : donorName || user?.name || "Student Supporter";

    const finalDonorEmail = user?.email || donorEmail || null;

    // Generate unique audit transaction reference
    const transactionRef = `NITAP-SIM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Execute atomic transaction for campaign balance update and donation record
    const [donation, updatedCampaign] = await prisma.$transaction([
      prisma.donation.create({
        data: {
          campaignId: campaign.id,
          donorId: user?.id || null,
          donorName: finalDonorName,
          donorEmail: finalDonorEmail,
          amount: donationAmount,
          isAnonymous: Boolean(isAnonymous),
          message: message || null,
          transactionRef,
          paymentMethod,
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

    // Notify campaign organizer
    await prisma.notification.create({
      data: {
        userId: campaign.userId,
        title: "New Campaign Donation!",
        message: `${finalDonorName} contributed ₹${donationAmount.toLocaleString("en-IN")} to "${campaign.title}".`,
        link: `/philanthropy/${campaign.id}`,
        type: "PHILANTHROPY",
      },
    });

    // Notify donor if logged in
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Donation Receipt Generated",
          message: `Thank you for contributing ₹${donationAmount.toLocaleString("en-IN")} to "${campaign.title}". Txn Ref: ${transactionRef}`,
          link: `/philanthropy/${campaign.id}`,
          type: "PHILANTHROPY",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Test donation processed successfully (Demo Mode)",
      donation: {
        id: donation.id,
        amount: donation.amount,
        donorName: donation.donorName,
        transactionRef: donation.transactionRef,
        paymentMethod: donation.paymentMethod,
        isSimulated: true,
        createdAt: donation.createdAt,
      },
      updatedCampaign: {
        raisedAmount: updatedCampaign.raisedAmount,
        targetAmount: updatedCampaign.targetAmount,
        percentage: Math.min(Math.round((updatedCampaign.raisedAmount / updatedCampaign.targetAmount) * 100), 100),
      },
    });
  } catch (error) {
    console.error("Donation processing error:", error);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
