import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import LoginImg from "@/assets/login.png"

const Login = () => {
    const [open, setOpen] = useState(false);
    const formSchema = z.object({
        phone: z.string().min(11, {
            message: "phone must be at least 11 characters.",
        }),
        code: z.string().min(6, {
            message: "code must be at least 6 characters.",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: "",
            code: "",
        },
    })

    function handleLogin() {
        form.reset()
        setOpen(true)
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('%c [ values ]-40', 'font-size:13px; background:pink; color:#bf2c9f;', values)
        setOpen(false)
    }
    return (
        <div className="w-[100vw] h-[100vh] bg-secondary flex justify-center items-center">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="min-w-216 h-130">
                    <div className="w-200 h-120 flex items-center justify-around flex-row p-14 gap-3">
                        <div className="flex-1">
                            <img src={LoginImg} alt="login" className="w-89 h-72.5" />
                        </div>
                        <div className="flex-1 w-full h-full mt-18 flex flex-col gap-8">
                            <div className="font-semibold text-2xl">登录 OI Practice</div>
                            <div>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="请输入手机号" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <FormField
                                                    control={form.control}
                                                    name="code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="请输入验证码" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button>验证码</Button>
                                        </div>
                                        <Button type="submit" variant="default" className="bg-primary w-80 py-6 text-xl rounded-full">登录</Button>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Button onClick={handleLogin}>去登录</Button>
        </div>
    );
}

export default Login;
