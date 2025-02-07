"use client";

import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  limit,
  startAfter,
  orderBy,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { User, AlertTriangle, Search, Home } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  adCount: number;
  reportCount: number;
  reports: string[];
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAds, setTotalAds] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const usersPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (search: string = "") => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const adsSnapshot = await getDocs(collection(db, "ads"));
    const reportsSnapshot = await getDocs(collection(db, "reports"));

    setTotalUsers(usersSnapshot.size);
    setTotalAds(adsSnapshot.size);
    setTotalReports(reportsSnapshot.size);

    let q = query(
      collection(db, "users"),
      orderBy("name"),
      limit(usersPerPage)
    );

    if (search) {
      q = query(
        q,
        where("name", ">=", search),
        where("name", "<=", search + "\uf8ff")
      );
    }

    const querySnapshot = await getDocs(q);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    const userData: UserData[] = await Promise.all(
      querySnapshot.docs.map(async (userDoc) => {
        const userAdsSnapshot = await getDocs(
          query(collection(db, "ads"), where("userId", "==", userDoc.id))
        );
        const userReportsSnapshot = await getDocs(
          query(
            collection(db, "reports"),
            where("reportedUserId", "==", userDoc.id)
          )
        );

        return {
          id: userDoc.id,
          name: userDoc.data().name,
          email: userDoc.data().email,
          adCount: userAdsSnapshot.size,
          reportCount: userReportsSnapshot.size,
          reports: userReportsSnapshot.docs.map((doc) => doc.data().reason),
        };
      })
    );

    setUsers(userData);
    setCurrentPage(1);
  };

  const handleRedirect = () => {
    window.location.href = "/";
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm("Сигурни ли сте, че искате да изтриете този потребител?")
    ) {
      await deleteDoc(doc(db, "users", userId));
      await deleteAssociatedData(userId);
      setUsers(users.filter((user) => user.id !== userId));
      setTotalUsers(totalUsers - 1);
    }
  };

  const deleteAssociatedData = async (userId: string) => {
    const collections = ["ads", "reports", "ratings", "chats"];
    for (const collectionName of collections) {
      const snapshot = await getDocs(
        query(collection(db, collectionName), where("userId", "==", userId))
      );
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(searchTerm);
  };

  const loadMoreUsers = async () => {
    if (!lastVisible) return;

    let q = query(
      collection(db, "users"),
      orderBy("name"),
      startAfter(lastVisible),
      limit(usersPerPage)
    );

    if (searchTerm) {
      q = query(
        q,
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff")
      );
    }

    const querySnapshot = await getDocs(q);
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    const newUserData: UserData[] = await Promise.all(
      querySnapshot.docs.map(async (userDoc) => {
        const userAdsSnapshot = await getDocs(
          query(collection(db, "ads"), where("userId", "==", userDoc.id))
        );
        const userReportsSnapshot = await getDocs(
          query(
            collection(db, "reports"),
            where("reportedUserId", "==", userDoc.id)
          )
        );

        return {
          id: userDoc.id,
          name: userDoc.data().name,
          email: userDoc.data().email,
          adCount: userAdsSnapshot.size,
          reportCount: userReportsSnapshot.size,
          reports: userReportsSnapshot.docs.map((doc) => doc.data().reason),
        };
      })
    );

    setUsers([...users, ...newUserData]);
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Административен панел
        </h1>
        <motion.button
          onClick={handleRedirect}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home size={18} className="mr-2" />
          Към началната страница
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Общо потребители"
          value={totalUsers}
          icon={<User size={24} />}
        />
        <StatCard
          title="Общо обяви"
          value={totalAds}
          icon={<AlertTriangle size={24} />}
        />
        <StatCard
          title="Общо докладвания"
          value={totalReports}
          icon={<AlertTriangle size={24} />}
        />
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Търсене по име или имейл"
            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="bg-yellow-500 text-white p-2 rounded-r-md hover:bg-yellow-600 transition-colors"
          >
            <Search size={24} />
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Име
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имейл
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Брой обяви
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Брой докладвания
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Докладвания
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 whitespace-nowrap">{user.name}</td>
                <td className="py-4 px-4 whitespace-nowrap">{user.email}</td>
                <td className="py-4 px-4 whitespace-nowrap">{user.adCount}</td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {user.reportCount}
                </td>
                <td className="py-4 px-4">
                  <ul className="list-disc list-inside">
                    {user.reports.map((report, index) => (
                      <li key={index} className="text-sm text-gray-500">
                        {report}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Изтрий
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === usersPerPage && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMoreUsers}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            Зареди още
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <div className="text-yellow-500">{icon}</div>
    </div>
    <p className="text-3xl font-bold text-gray-700">{value}</p>
  </motion.div>
);

export default AdminPanel;
