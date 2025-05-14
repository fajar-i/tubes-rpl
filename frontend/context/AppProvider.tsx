"use client";
import Loader from "@/components/Loader";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
interface AppProviderType {
    login: (email: string, password: string) => Promise<void>,
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>,
    isLoading: boolean
}

const AppContext = createContext<AppProviderType | undefined>(undefined)
const API_URL = process.env.NEXT_PUBLIC_API_URL
export const AppProvider = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [authToken, setAuthToken] = useState<string|null>(null)
    const router = useRouter()
    useEffect(()=>{
        const token = Cookies.get("authToken")
        if (token) {
            setAuthToken(token);
        } else {
            router.push("/auth")
        }
    })
    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password })
            console.log(response)
            if (response.data.status) {
                Cookies.set("authToken", response.data.token, {expires:7});
                setAuthToken(response.data.token);
                router.push("/dashboard");
                console.log("beres")
                toast.success("Login succesful");
            } else {
                toast.error("Invalid login details");
            }
        } catch (error) {
            console.log(`Auth error: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }
    const register = async (name: string, email: string, password: string, password_confirmation: string) => {
        setIsLoading(true)
        try {
            const response = await axios.post(`${API_URL}/register`, { name, email, password, password_confirmation })
            console.log(response)
        } catch (error) {
            console.log(`Auth error: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppContext.Provider value={{ login, register, isLoading }}>
            {isLoading ? <Loader /> : children}
        </AppContext.Provider>
    )
}


export const myAppHook = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("Context will be wrapped inside AppProvider")
    return context
}