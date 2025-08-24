import { goapi } from "@/lib/utils";
import { AxiosError } from "axios";

export async function logout() {
    try {
        const res = await goapi.post(
            `${process.env.NEXT_PUBLIC_GOSERVER_BASE_URL}/api/auth/logout`,
            {}
        );
        return { status: res.data.success };
    } catch (error: unknown) {
        console.error("Logout failed:", (error as AxiosError).response?.data);
        return { status: false };
    }
}
