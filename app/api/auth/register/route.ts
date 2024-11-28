import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import { User } from "@/interfaces";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Prisma Client
const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res
          .status(500)
          .json({ message: "Error processing the request." });
      }

      // Ensure fields are strings
      const name = fields.name?.[0] || "";
      const username = fields.username?.[0] || "";
      const email = fields.email?.[0] || "";
      const password = fields.password?.[0] || "";
      const confirmPassword = fields.confirmPassword?.[0] || "";
      const profileImage = files.profileImage
        ? files.profileImage[0].filepath
        : null;

      // Validation
      if (!name || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailValid) {
        return res.status(400).json({ message: "Invalid email address." });
      }

      const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
      if (!isUsernameValid) {
        return res.status(400).json({
          message:
            "Username must be between 3 and 20 characters, and only contain letters, numbers, or underscores.",
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      const isPasswordStrong = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(
        password
      );
      if (!isPasswordStrong) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and contain both letters and numbers.",
        });
      }

      const defaultProfileImage = "https://example.com/default-profile.png";

      try {
        console.log("Checking if user exists...");
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        });

        if (existingUser) {
          console.log("User already exists:", existingUser);
          return res
            .status(400)
            .json({ message: "Email or username already exists." });
        }

        console.log("Creating new user...");
        const hashedPassword = await hash(password, 10);
        const user = await prisma.user.create({
          data: {
            name,
            username,
            email,
            password: hashedPassword,
            profileImage: profileImage || defaultProfileImage,
          },
        });

        console.log("User created:", user);
        return res.status(201).json({ userId: user.id });
      } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Server error." });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
