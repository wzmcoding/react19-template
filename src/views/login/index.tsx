import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router";
import { z } from "zod"

import LoginImg from "@/assets/login.png"
import { service } from "@/api";
import { useMutation } from "@tanstack/react-query"
import { dialog } from "@/utils";
import { useUserStore } from "@/stores/user";


let timer;
const Login = () => {
    const [codeCd, setCodeCd] = useState(false)
    const [long, setLong] = useState(60)
    const mutation = useMutation({ mutationFn: service.auth.login })
    const navigate = useNavigate()
    const { setToken, setUser } = useUserStore()

    const formSchema = z.object({
        phone: z.string().nonempty({
            message: "请输入手机号",
        }),
        code: z.string().nonempty({
            message: "请输入验证码",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: "",
            code: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = await mutation.mutateAsync(values)
            setToken(data.authorization)
            setUser(data.user)
            navigate('/')
        } catch (error) {
            console.log(error)
        }
    }


    function handleCaptcha() {
        // 校验手机号是否存在，格式是否正确
        const phone = form.getValues('phone')
        if (!phone || !phone.match(/^1[3456789]\d{9}$/)) {
            dialog.toast('手机号格式错误')
            return
        }
        captcha(phone)
        setCodeCd(true)
        timer = setInterval(() => {
            if (long > 0) {
                setLong((prev) => prev - 1)
            } else {
                setLong(60)
                setCodeCd(false)
                clearInterval(timer)
            }
        }, 1000)
    }

    async function captcha(phone: string) {
        try {
            await service.auth.code({ phone })
            dialog.toast('验证码已发送，请注意查收')
        }
        catch (err: unknown) {
            console.log(err)
            dialog.toast('验证码发送失败')
            setLong(60)
            setCodeCd(false)
            clearInterval(timer)
        }
    }

    function handleBackHome() {
        navigate('/')
    }

    return (
        <div className="w-[100vw] h-[100vh] flex justify-center items-center bg-primary/8">
            <div className="">
                <div className="flex items-center justify-around flex-row p-14">
                    <div className="h-147.5 w-144 ">
                        <img src={LoginImg} alt="login" className="h-147.5 w-144 object-cover" />
                    </div>
                    <div className="px-14 h-147.5 w-144 flex pt-10 flex-col gap-8 bg-background">
                        <div className="mt-3 flex items-center justify-center gap-3">
                            <img src="/logo.svg" alt="logo" className="h-10 w-10 object-cover" />
                            <div className="text-6 text-primary font-semibold">
                                Practix
                            </div>
                        </div>
                        <div className="text-center text-3xl font-semibold">
                            Welcome back！
                        </div>
                        <div className="px-16">
                            {mutation.error && (
                                <h5 onClick={() => mutation.reset()}>{mutation.error?.message}</h5>
                            )}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>手机号</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11" placeholder="请输入手机号" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex items-end justify-between gap-2">
                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>验证码</FormLabel>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <FormControl>
                                                                <Input className="h-11" placeholder="请输入验证码" {...field} />
                                                            </FormControl>
                                                            <Button className="h-11" onClick={handleCaptcha} disabled={codeCd}>验证码{codeCd && <span>({long})</span>}</Button>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="default" className="bg-primary w-full py-4.6 text-xl rounded-full mb-4!">登录</Button>
                                    <Button type="button" variant="outline" className="w-full py-4.5 text-xl rounded-full" onClick={handleBackHome}>返回首页</Button>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
