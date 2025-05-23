"use client"
import Link from "next/link"
import { myAppHook } from "@/context/AppProvider"
const Navbar = () => {
    const { logout, authToken } = myAppHook();
    return <>
        <nav className="navbar navbar-expand-lg ">
                <div className="container container header-container">
                    <Link className="logo" href="/">Analis</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto nav-links">
                            {
                                authToken ? (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" href="/form">Soal</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" href="/dashboard">Jawaban</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" href="/form">Hasil</Link>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link logout" style={{color:'red'}} onClick={logout}>Logout</a>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" href="/dokumentasi">Dokumentasi</Link>
                                        </li>
                                        <li className="nav-item">
                                            <a href='http://github.com/fajar-i/tubes-rpl' target="_blank" rel="noopener noreferrer" className="nav-link">Source Code</a>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" href="/auth">Login</Link>
                                        </li> </>
                                )
                            }

                        </ul>
                    </div>
                </div>
        </nav>
    </>
}

export default Navbar