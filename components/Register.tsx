import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  onSuccess: () => void; // Новия пропс за обработка на успешната регистрация
}

const Register = ({ onSuccess }: RegisterProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert("Паролите не съвпадат.");
      return;
    }

    const form = new FormData();
    form.append("name", name);
    form.append("username", username);
    form.append("email", email);
    form.append("password", password);
    form.append("confirmPassword", confirmPassword);
    if (profileImage) {
      form.append("profileImage", profileImage);
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Възникна грешка при регистрацията.");
      } else {
        alert("Регистрацията е успешна!");
        onSuccess();
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Грешка при връзката със сървъра.");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
      <h1 className="text-center text-2xl font-bold mb-6">
        Създаване на профил
      </h1>
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Име"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Потребителско име"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Имейл"
          onChange={handleInputChange}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="relative">
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Парола"
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="relative">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Потвърди паролата"
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col items-center w-full">
          <label
            htmlFor="profileImage"
            className="cursor-pointer bg-yellow-500 rounded-lg h-32 w-32 flex items-center justify-center text-white text-4xl relative"
          >
            <div
              className={`absolute inset-0 ${
                profileImage ? "bg-white" : ""
              } rounded-lg flex items-center justify-center`}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="rounded-lg h-full w-full object-cover"
                />
              ) : (
                <span>+</span>
              )}
            </div>
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="mt-4 text-center text-gray-600">
            Добавяне на профилна снимка
          </p>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-bold py-3 rounded-bl-xl rounded-tr-xl hover:bg-green-600 transition"
          >
            Регистрация
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
