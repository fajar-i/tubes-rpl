"use client";
import React, { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppProvider";
import { useRouter } from "next/navigation";
import { RegisterData } from "@/types";
import Navbar from "@/components/layout/Navbar";

const Auth: React.FC = () => {
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
                    <h3 className="text-2xl font-bold text-center mb-6">{isLogin ? "Login" : "Register"}</h3>
                    <form onSubmit={handleFormSubmit}>
                        {!isLogin && (
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleOnChangeInput}
                                placeholder="Name"
                                required
                            />
                        )}
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleOnChangeInput}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleOnChangeInput}
                            placeholder="Password"
                            required
                        />
                        {!isLogin && (
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={handleOnChangeInput}
                                placeholder="Confirm Password"
                                required
                            />
                        )}
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300" type="submit">
                            {isLogin ? "Login" : "Register"}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            onClick={() => setIsLogin(!isLogin)}
                            className="cursor-pointer text-blue-600 hover:underline"
                        >
                            {isLogin ? "Register" : "Login"}
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Auth;
