import { Outlet } from "@remix-run/react";
import { Header } from "~/components/Header";
import styles from "./layout.module.css";

export default function Layout() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
        </>
    );
}
