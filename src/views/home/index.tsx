import NavBar from "@/components/NavBar";
import { useUserStore } from "@/stores/user";
import { useEffect } from "react";

const Home = () => {
    const { setToken, setUser, token, user } = useUserStore();

    function init() {
        setToken(token);
        setUser(user);
    }

    useEffect(() => {
        init();
    }, []);
    return (
        <div className="h-full flex items-stretch bg-background">
            <NavBar />
            <div className="h-full flex-1">
                <div className="h-full w-full">
                    <div className="h-full flex gap-15">
                        <div className="flex-1 pb-3 pl-25 pt-12">
                            <div className="relative h-full w-full">content</div>
                        </div>
                        <div>知识点列表</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
