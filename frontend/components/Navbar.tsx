"use client"
import Link from "next/link"
import { myAppHook } from "@/context/AppProvider"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
const Navbar = () => {
  const [projectId, setProjectId] = useState<string>();
  const id = usePathname().split('/')[2];
  useEffect(() => {
    setProjectId(id);
  }, [id]);
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
                    <Link className="nav-link" href="/project">Project saya</Link>
                  </li>
                  {
                    projectId ? (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link" href={`/project/${projectId}/form`}>Soal</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" href={`/project/${projectId}/jawaban`}>Jawaban</Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" href={`/project/${projectId}/form`}>Hasil</Link>
                        </li>
                      </>
                    ) : null
                  }
                  <li className="nav-item">
                    <a className="nav-link logout" style={{ color: 'red', marginRight: '40px' }} onClick={logout}>Logout</a>
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
                    <Link className="nav-link" href="/auth" style={{marginRight: '40px'}}>Login</Link>
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