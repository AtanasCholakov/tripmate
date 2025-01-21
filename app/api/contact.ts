import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Методът не е позволен." });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Всички полета са задължителни." });
  }

  try {
    // Настройка на транспортер за Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Или друга услуга
      auth: {
        user: process.env.EMAIL_USER, // Имейл акаунт
        pass: process.env.EMAIL_PASS, // Парола
      },
    });

    // Конфигурация на имейла
    await transporter.sendMail({
      from: email, // Имейл на подателя
      to: process.env.EMAIL_RECEIVER, // Имейл на получателя
      subject: `Нов контакт от ${name}`, // Заглавие
      text: message, // Съдържание на съобщението
    });

    return res
      .status(200)
      .json({ message: "Съобщението е изпратено успешно." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Неуспешно изпращане на съобщение." });
  }
}
