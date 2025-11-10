"use client";

import React, { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import { RegisterData } from "@/types";
import Navbar from "@/components/layout/Navbar";
import useTitle from "@/hooks/useTitle";

const Auth: React.FC = () => {
    useTitle('Analis - Masuk', 'Registrasi user ke Analis')
    const router = useRouter();
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [formData, setFormData] = useState<RegisterData>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const { login, register, authToken, isLoading } = useMyAppHook();
    
    useEffect(() => {
        if (authToken) {
            router.push("/dashboard");
            return;
        }
    }, [router, authToken, isLoading]);

    const handleOnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLogin) {
            try {
                await login(formData.email, formData.password)
            } catch (error) {
                console.log(`Auth error: ${error}`)
            }
        }
        else {
            try {
                await register(formData.name!, formData.email, formData.password, formData.password_confirmation!)
            } catch (error) {
                console.log(`Auth error: ${error}`)
            }
        }
    }
    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center mt-14">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h3 className="text-2xl font-bold text-center mb-6">{isLogin ? "Masuk" : "Daftar"}</h3>
                    <form onSubmit={handleFormSubmit}>
                        {!isLogin && (
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleOnChangeInput}
                                placeholder="Masukkan nama"
                                required
                            />
                        )}
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleOnChangeInput}
                            placeholder="Masukkan email"
                            required
                        />
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleOnChangeInput}
                            placeholder="Masukkan password"
                            required
                        />
                        {!isLogin && (
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={handleOnChangeInput}
                                placeholder="Konfirmasi password"
                                required
                            />
                        )}
                        <button className="w-full bg-[#00A19A] text-white py-2 px-4 rounded-md hover:bg-[#00969e] cursor-pointer transition-colors duration-300" type="submit">
                            {isLogin ? "Masuk" : "Daftar"}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-gray-600">
                        {isLogin ? "Tidak punya akun? " : "Sudah punya akun? "}
                        <span
                            onClick={() => setIsLogin(!isLogin)}
                            className="cursor-pointer text-[#00A19A] hover:underline"
                        >
                            {isLogin ? "Daftar" : "Masuk"}
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Auth;
