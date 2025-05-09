import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import LoginImg from "@/assets/login.png"

const Login = () => {
    return (
        <div className="w-[100vw] h-[100vh] bg-secondary flex justify-center items-center">
            <Card className="w-200 h-120 flex items-center justify-around flex-row p-14">
                <div className="flex-1">
                    <img src={LoginImg} alt="login" className="w-89 h-72.5" />
                </div>
                <div className="flex-1 w-full h-full mt-15 flex flex-col gap-8">
                    <CardHeader>
                        <CardTitle>登录OI Practice</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Card Content</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="default" className="bg-primary">登录</Button>
                    </CardFooter>
                </div>
            </Card>

        </div>
    );
}

export default Login;
