import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as cors from "cors";

admin.initializeApp();

const corsHandler = cors({ origin: true });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "atanascholakov20a@gmail.com",
    pass: "26102006",
  },
});

export const sendVerificationCode = functions.https.onRequest(
  (request, response) => {
    corsHandler(request, response, async () => {
      try {
        const { email } = request.body;
        const code = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code

        const mailOptions = {
          from: "atanascholakov20a@gmail.com",
          to: email,
          subject: "Вашият код за верификация",
          text: `Вашият код за верификация е: ${code}`,
        };

        await transporter.sendMail(mailOptions);
        await admin.firestore().collection("verificationCodes").doc(email).set({
          code: code.toString(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        response.status(200).send({ success: true });
      } catch (error) {
        console.error("Error sending email:", error);
        response.status(500).send({ success: false, error: error.message });
      }
    });
  }
);
